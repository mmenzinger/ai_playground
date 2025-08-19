import { useState, useEffect } from 'react';
import store, { File, Project } from '@store';
import { autorun } from 'mobx';
import { ControlledTreeEnvironment, Tree, TreeItemIndex, TreeItem, DraggingPosition } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';


function isFolder(fileName: string): boolean {
  return !fileName.includes('.');
}

// Function to get the appropriate icon for a file or folder
function getFileIcon(name: string, isFolder: boolean): string {
  if (isFolder) {
    return '/assets/filetree/folder.svg';
  }
  
  const parts = name.split('.');
  if (parts.length === 1) {
    return '/assets/filetree/folder.svg'; // Fallback for items without extension
  }
  
  const extension = parts[parts.length - 1].toLowerCase();
  const supportedExtensions = ['jpg', 'js', 'json', 'md', 'pl', 'png'];
  
  if (supportedExtensions.includes(extension)) {
    return `/assets/filetree/${extension}.svg`;
  }
  
  return '/assets/filetree/unknown.svg';
}

// Convert File[] to react-complex-tree item map
type TreeItems = Record<string, {
  index: string;
  isFolder: boolean;
  children: string[];
  data: string;
  file?: File;
}>;

function filesToTreeItems(projectFiles: File[], globalFiles: File[]): TreeItems {
  // Helper to build children with sorting
  function buildItems(files: File[], parentId: number | string) {
    return files
      .filter(f => f.parentId === parentId)
      .sort((a, b) => {
        const aIsFolder = !a.name.includes('.');
        const bIsFolder = !b.name.includes('.');
        
        // Folders before files
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        
        // Alphabetical within same type
        return a.name.localeCompare(b.name);
      })
      .map(f => String(f.id));
  }

  const items: TreeItems = {
    root: {
      index: 'root',
      isFolder: true,
      children: ['global', 'project'],
      data: 'Root',
    },
    global: {
      index: 'global',
      isFolder: true,
      children: buildItems(globalFiles, 0),
      data: 'global',
    },
    project: {
      index: 'project',
      isFolder: true,
      children: buildItems(projectFiles, 0),
      data: 'project',
    },
  };

  // Add all global files
  for (const file of globalFiles) {
    items[String(file.id)] = {
      index: String(file.id),
      isFolder: !file.name.includes('.'),
      children: buildItems(globalFiles, file.id),
      data: file.name,
      file,
    };
  }

  // Add all project files
  for (const file of projectFiles) {
    items[String(file.id)] = {
      index: String(file.id),
      isFolder: !file.name.includes('.'),
      children: buildItems(projectFiles, file.id),
      data: file.name,
      file,
    };
  }

  return items;
}

interface FileTreeProps {
  project: Project;
}

function FileTree(props: FileTreeProps) {
  const [treeItems, setTreeItems] = useState<TreeItems>({});
  const [expandedItems, setExpandedItems] = useState(['project']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [focusedItem, setFocusedItem] = useState<string | undefined>(undefined);

  useEffect(() => {
    let closed = false;
    const disposer = autorun(async () => {
      store.project.lastFileTreeChange;
      const [projectFiles, globalFiles] = await Promise.all([
        store.project.getProjectFiles(props.project.id),
        store.project.getProjectFiles(0),
      ]);
      if (!closed) {
        const items = filesToTreeItems(projectFiles, globalFiles);
        setTreeItems(items);
        
        // Update selected items based on active file
        if (store.project.activeFile) {
          const activeItemId = store.project.activeFile.projectId === 0 
            ? 'g' + store.project.activeFile.id 
            : 'p' + store.project.activeFile.id;
          setSelectedItems([activeItemId]);
        } else {
          setSelectedItems([]);
        }
      }
    });
    return () => {
      closed = true;
      disposer();
    };
  }, [props.project.id]);

  const handleSelectItems = (items: TreeItemIndex[]) => {
    // Handle file selection
    setSelectedItems(items.map(String));
    if (items.length > 0) {
      const selectedItem = treeItems?.[String(items[0])];
      // Only open file if the selected item is actually a file (not a folder)
      if (selectedItem?.file && !selectedItem.isFolder) {
        store.project.openFile(selectedItem.file.id);
      }
    }
  };

  // Helper function to sort children alphabetically with folders first
  const sortChildren = (items: TreeItems, parentIndex: string): string[] => {
    const parent = items[parentIndex];
    if (!parent) return [];
    
    return parent.children.sort((a, b) => {
      const itemA = items[a];
      const itemB = items[b];
      
      if (!itemA || !itemB) return 0;
      
      // Folders before files
      if (itemA.isFolder && !itemB.isFolder) return -1;
      if (!itemA.isFolder && itemB.isFolder) return 1;
      
      // Alphabetical within same type
      return itemA.data.localeCompare(itemB.data);
    });
  };

  const handleDrop = (items: TreeItem[], target: DraggingPosition) => {
    if (!treeItems) return;
    
    // Create a copy of the current tree items
    const newTreeItems = { ...treeItems };
    
    for (const item of items) {
      const sourceItem = newTreeItems[String(item.index)];
      
      if (sourceItem?.file && target.targetType === 'item') {
        const targetItem = newTreeItems[String(target.targetItem)];
        
        if (targetItem) {
          let newParentIndex: string;
          
          if (targetItem.index === 'global' || targetItem.index === 'project') {
            newParentIndex = targetItem.index;
          } else if (targetItem.isFolder) {
            newParentIndex = targetItem.index;
          } else {
            // Dropping onto a file - find its parent
            const parentPrefix = targetItem.index.startsWith('g') ? 'g' : 'p';
            const parentId = targetItem.file?.parentId || 0;
            newParentIndex = parentId === 0 ? (parentPrefix === 'g' ? 'global' : 'project') : parentPrefix + parentId;
          }
          
          // Remove item from old parent's children
          for (const parentKey of Object.keys(newTreeItems)) {
            const parent = newTreeItems[parentKey];
            const itemIndex = parent.children.indexOf(sourceItem.index);
            if (itemIndex > -1) {
              parent.children.splice(itemIndex, 1);
              // Sort the old parent's children
              parent.children = sortChildren(newTreeItems, parentKey);
              break;
            }
          }
          
          // Add item to new parent's children
          const newParent = newTreeItems[newParentIndex];
          if (newParent && !newParent.children.includes(sourceItem.index)) {
            newParent.children.push(sourceItem.index);
            // Sort the new parent's children
            newParent.children = sortChildren(newTreeItems, newParentIndex);
          }
        }
      }
    }
    
    // Update the tree items state
    setTreeItems(newTreeItems);
  };
  
  return (
    <ControlledTreeEnvironment
      items={treeItems}
      getItemTitle={item => item.data}
      viewState={{
        'file-tree': {
          expandedItems,
          selectedItems,
          focusedItem,
        }
      }}
      onExpandItem={(item) => setExpandedItems([...expandedItems, String(item.index)])}
      onCollapseItem={(item) => setExpandedItems(expandedItems.filter(id => id !== String(item.index)))}
      onSelectItems={handleSelectItems}
      onFocusItem={(item) => setFocusedItem(String(item.index))}
      onDrop={handleDrop}
      canDragAndDrop={true}
      canDropOnFolder={true}
      canReorderItems={false}
      renderItemTitle={({ title, item }) => {
        const treeItem = treeItems?.[item.index];
        const iconSrc = getFileIcon(title, treeItem?.isFolder || false);
        
        return (
          <div
            className="w-full flex items-center gap-1"
            onContextMenu={e => {
              e.preventDefault();

              if (treeItem?.file && !treeItem.isFolder) {
                setSelectedItems([String(item.index)]);
                store.project.openFile(treeItem.file.id);
              }
              console.log('Context menu for item:', item);
            }}
          >
            <img src={iconSrc} alt="" className={`w-${isFolder(title) ? 4 : 3} h-4`} />
            <span>{title}</span>
          </div>
        );
      }}
    >
      <Tree treeId="file-tree" rootItem="root" treeLabel="File Tree" />
    </ControlledTreeEnvironment>
  );
}

export default FileTree;
