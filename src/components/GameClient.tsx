"use client";

import { useEffect, useReducer } from "react";
import { currentPlayer, currentRound, isFinalRound, matchReducer, startMatch, type MatchAction } from "@/game/state";
import { clearMatch, loadMatch, saveMatch } from "@/game/storage";
import type { Match, MatchConfig } from "@/game/types";
import { useHydrated } from "@/hooks/useHydrated";
import { PassScreen } from "./PassScreen";
import { ResultsScreen } from "./ResultsScreen";
import { RevealScreen } from "./RevealScreen";
import { SetupScreen } from "./SetupScreen";
import { TopBar } from "./TopBar";
import { TurnScreen } from "./TurnScreen";
import { Screen } from "./ui";

type GameState = Match | null;

type GameAction = { type: "start"; config: MatchConfig } | { type: "reset" } | MatchAction;

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "start":
      return startMatch(action.config, Math.random);
    case "reset":
      return null;
    default:
      if (!state) throw new Error("No match in progress");
      return matchReducer(state, action);
  }
};

const resumableMatch = (): GameState => {
  const saved = loadMatch();
  return saved && saved.phase !== "results" ? saved : null;
};

export function GameClient() {
  const hydrated = useHydrated();
  return hydrated ? <GameBoard /> : <Screen />;
}

function GameBoard() {
  const [match, dispatch] = useReducer(gameReducer, null, resumableMatch);

  useEffect(() => {
    if (match && match.phase !== "results") saveMatch(match);
    else clearMatch();
  }, [match]);

  if (!match) {
    return (
      <Screen>
        <TopBar label="New game" />
        <SetupScreen onStart={(config) => dispatch({ type: "start", config })} />
      </Screen>
    );
  }

  const roundLabel = `Round ${match.roundIndex + 1}/${match.config.rounds}`;
  const round = currentRound(match);
  const player = currentPlayer(match);

  return (
    <Screen>
      <TopBar label={roundLabel} />
      {match.phase === "pass" && (
        <PassScreen
          player={player}
          roundNumber={match.roundIndex + 1}
          totalRounds={match.config.rounds}
          onBegin={() => dispatch({ type: "begin-turn", now: Date.now() })}
        />
      )}
      {match.phase === "turn" && match.turnEndsAt !== null && (
        <TurnScreen
          key={`${match.roundIndex}-${match.turnIndex}`}
          player={player}
          letter={round.letter}
          endsAt={match.turnEndsAt}
          timerSeconds={match.config.timerSeconds}
          onSubmit={(answers) => dispatch({ type: "submit-turn", answers })}
        />
      )}
      {match.phase === "reveal" && (
        <RevealScreen
          match={match}
          isFinal={isFinalRound(match)}
          onToggleReject={(playerId, category) => dispatch({ type: "toggle-reject", playerId, category })}
          onValidated={(verdicts) => dispatch({ type: "set-validation", verdicts })}
          onNext={() => dispatch({ type: "next-round", random: Math.random })}
        />
      )}
      {match.phase === "results" && <ResultsScreen match={match} onPlayAgain={() => dispatch({ type: "reset" })} />}
    </Screen>
  );
}
