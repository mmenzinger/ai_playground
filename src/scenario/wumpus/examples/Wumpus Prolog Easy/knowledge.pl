:-dynamic(size/1).
:-dynamic(visited/2).
:-dynamic(breeze/2).
:-dynamic(stench/2).
:-dynamic(scream/0).

%-------------------------------------------------------------------------------
inmap(X,Y) :-
    size(S),
    Size is S-1,
	between(0,Size,X),
    between(0,Size,Y).

%-------------------------------------------------------------------------------
adjacent(X1,Y1,X2,Y2) :- 
    inmap(X1,Y1),
    inmap(X2,Y2),
    1 is abs(X2-X1) + abs(Y2-Y1).

%-------------------------------------------------------------------------------
% all known adjacent tiles contain breeze
possiblePit(X,Y) :-
    inmap(X,Y),
    \+visited(X,Y),
    X1 is X-1, (\+visited(X1,Y); breeze(X1,Y)),
    X2 is X+1, (\+visited(X2,Y); breeze(X2,Y)),
    Y1 is Y-1, (\+visited(X,Y1); breeze(X,Y1)),
    Y2 is Y+1, (\+visited(X,Y2); breeze(X,Y2)).

%-------------------------------------------------------------------------------
% there is a breeze with 3 known non pit tiles -> last tile must be a pit
certainPit(X,Y) :-
    possiblePit(X,Y),
    adjacent(X,Y,X1,Y1),
    breeze(X1,Y1),
    X2 is X1-1, (\+inmap(X2,Y1); visited(X2,Y1); X2 = X),
    X3 is X1+1, (\+inmap(X3,Y1); visited(X3,Y1); X3 = X),
    Y2 is Y1-1, (\+inmap(X1,Y2); visited(X1,Y2); Y2 = Y),
    Y3 is Y1+1, (\+inmap(X1,Y3); visited(X1,Y3); Y3 = Y).

%-------------------------------------------------------------------------------
% all known adjacent tiles contain stench
possibleWumpus(X,Y) :-
    \+scream,
    inmap(X,Y),
    \+visited(X,Y),
    X1 is X-1, (\+visited(X1,Y); stench(X1,Y)),
    X2 is X+1, (\+visited(X2,Y); stench(X2,Y)),
    Y1 is Y-1, (\+visited(X,Y1); stench(X,Y1)),
    Y2 is Y+1, (\+visited(X,Y2); stench(X,Y2)).

%-------------------------------------------------------------------------------
% at least two adjacent tiles contain stench
% (and the diagonal third tile is visited)
certainWumpus(X,Y) :-
    \+scream,
    inmap(X,Y),
    \+visited(X,Y),
    (
        (X1 is X-1, X2 is X+1, stench(X1,Y), stench(X2,Y));
        (Y1 is Y-1, Y2 is Y+1, stench(X,Y1), stench(X,Y2));
        (X1 is X-1, Y1 is Y-1, stench(X1,Y), stench(X,Y1), visited(X1,Y1));
        (X1 is X+1, Y1 is Y-1, stench(X1,Y), stench(X,Y1), visited(X1,Y1));
        (X1 is X-1, Y1 is Y+1, stench(X1,Y), stench(X,Y1), visited(X1,Y1));
        (X1 is X+1, Y1 is Y+1, stench(X1,Y), stench(X,Y1), visited(X1,Y1))
    ).

%-------------------------------------------------------------------------------
% there is a stench with 3 known tiles -> last tile must be wumpus
certainWumpus(X,Y) :-
    possibleWumpus(X,Y),
    adjacent(X,Y,X1,Y1),
    stench(X1,Y1),
    X2 is X1-1, (\+inmap(X2,Y1); visited(X2,Y1); X2 = X),
    X3 is X1+1, (\+inmap(X3,Y1); visited(X3,Y1); X3 = X),
    Y2 is Y1-1, (\+inmap(X1,Y2); visited(X1,Y2); Y2 = Y),
    Y3 is Y1+1, (\+inmap(X1,Y3); visited(X1,Y3); Y3 = Y).

%-------------------------------------------------------------------------------
saveMove(X,Y) :- 
    inmap(X,Y),
    (
        visited(X,Y);
        (
            \+possiblePit(X,Y),
            \+possibleWumpus(X,Y)
        )
    ).

%-------------------------------------------------------------------------------
unsaveMove(X,Y) :-
    inmap(X,Y),
    (
        \+certainPit(X,Y),
        \+certainWumpus(X,Y)
    ).
