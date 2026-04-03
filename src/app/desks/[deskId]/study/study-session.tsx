"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ShuffleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type StudyCard = {
  id: string;
  front: string;
  back: string;
};

type StudySessionProps = {
  deskTitle: string;
  cards: StudyCard[];
};

function shuffledIndexes(length: number) {
  const indexes = Array.from({ length }, (_, i) => i);

  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }

  return indexes;
}

export function StudySession({ deskTitle, cards }: StudySessionProps) {
  const router = useRouter();
  const [order, setOrder] = React.useState(() =>
    Array.from({ length: cards.length }, (_, i) => i),
  );
  const [position, setPosition] = React.useState(0);
  const [showBack, setShowBack] = React.useState(false);
  const [seenCardIds, setSeenCardIds] = React.useState<Set<string>>(new Set());
  const [answersByCardId, setAnswersByCardId] = React.useState<
    Map<string, "correct" | "incorrect">
  >(new Map());

  const currentCard = cards[order[position]];
  const isFirst = position === 0;
  const isLast = position === cards.length - 1;

  React.useEffect(() => {
    if (!currentCard) return;

    setSeenCardIds((prev) => {
      if (prev.has(currentCard.id)) return prev;
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
  }, [currentCard]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        setShowBack((prev) => !prev);
      }

      if (event.key === "ArrowRight") {
        setPosition((prev) => Math.min(cards.length - 1, prev + 1));
        setShowBack(false);
      }

      if (event.key === "ArrowLeft") {
        setPosition((prev) => Math.max(0, prev - 1));
        setShowBack(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cards.length]);

  function goNext() {
    if (isLast) return;
    setPosition((prev) => prev + 1);
    setShowBack(false);
  }

  function goPrevious() {
    if (isFirst) return;
    setPosition((prev) => prev - 1);
    setShowBack(false);
  }

  function shuffleCards() {
    setOrder(shuffledIndexes(cards.length));
    setPosition(0);
    setShowBack(false);
    setSeenCardIds(new Set());
    setAnswersByCardId(new Map());
  }

  function resetSession() {
    setOrder(Array.from({ length: cards.length }, (_, i) => i));
    setPosition(0);
    setShowBack(false);
    setSeenCardIds(new Set());
    setAnswersByCardId(new Map());
  }

  function recordAnswer(result: "correct" | "incorrect") {
    if (!showBack || !currentCard) return;

    setAnswersByCardId((prev) => {
      const next = new Map(prev);
      next.set(currentCard.id, result);
      return next;
    });

    if (!isLast) {
      setPosition((prev) => prev + 1);
      setShowBack(false);
    }
  }

  if (!currentCard) return null;

  const progressPercent = Math.round((seenCardIds.size / cards.length) * 100);
  const answeredCount = answersByCardId.size;
  const answeredPercent = Math.round((answeredCount / cards.length) * 100);
  const correctCount = Array.from(answersByCardId.values()).filter(
    (value) => value === "correct",
  ).length;
  const incorrectCount = answeredCount - correctCount;
  const isFinished = answeredCount === cards.length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight md:text-4xl">{deskTitle}</p>
            <p className="text-sm text-muted-foreground">
              {isFinished ? "Study session complete" : `Card ${position + 1}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              Answered {answeredCount}/{cards.length}
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Correct: {correctCount}
            </span>
            <span className="font-medium text-destructive">Incorrect: {incorrectCount}</span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${answeredPercent}%` }}
          />
        </div>
      </div>

      {isFinished ? (
        <Card className="flex min-h-[340px] flex-1">
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="space-y-2">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">
                Study session is finished
              </p>
              <p className="text-muted-foreground">You have completed all cards in this desk.</p>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Correct answers</p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {correctCount}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Incorrect answers</p>
                <p className="text-2xl font-semibold text-destructive">{incorrectCount}</p>
              </div>
            </div>
            <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={resetSession}>
                Restudy
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Study other desk
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="flex min-h-[340px] flex-1">
            <CardContent className="flex flex-1 items-center justify-center p-8">
              <button
                type="button"
                className="w-full max-w-2xl rounded-xl p-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setShowBack((prev) => !prev)}
              >
                <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  {showBack ? "Answer" : "Question"}
                </p>
                <p className="whitespace-pre-wrap text-lg font-medium md:text-2xl">
                  {showBack ? currentCard.back : currentCard.front}
                </p>
              </button>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t">
              <div className="text-sm text-muted-foreground">
                {position + 1}/{cards.length} - {progressPercent}%
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={shuffleCards}>
                  <ShuffleIcon />
                  Shuffle
                </Button>
                <Button type="button" variant="outline" onClick={resetSession}>
                  Reset
                </Button>
              </div>
            </CardFooter>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={!showBack}
              onClick={() => recordAnswer("incorrect")}
            >
              <XIcon />
              Incorrect
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              disabled={!showBack}
              onClick={() => recordAnswer("correct")}
            >
              <CheckIcon />
              Correct
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" disabled={isFirst} onClick={goPrevious}>
              Previous
            </Button>
            <Button type="button" onClick={() => setShowBack((prev) => !prev)}>
              Flip
            </Button>
            <Button type="button" variant="outline" disabled={isLast} onClick={goNext}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
