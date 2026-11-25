
import { useState } from "react";

function useCursorPagination() {
  const [cursorHistory, setCursorHistory] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(null);

  const goToNext = (nextCursor) => {
    if (!nextCursor) return;

    setCursorHistory((previous) => [
      ...previous,
      currentCursor,
    ]);

    setCurrentCursor(nextCursor);
  };

  const goToPrevious = () => {
    if (cursorHistory.length === 0) return;

    const previousCursor =
      cursorHistory[cursorHistory.length - 1];

    setCursorHistory((previous) => previous.slice(0, -1));
    setCurrentCursor(previousCursor);
  };

  const resetPagination = () => {
    setCursorHistory([]);
    setCurrentCursor(null);
  };

  return {
    currentCursor,
    hasPreviousPage: cursorHistory.length > 0,
    goToNext,
    goToPrevious,
    resetPagination,
  };
}

export default useCursorPagination;
