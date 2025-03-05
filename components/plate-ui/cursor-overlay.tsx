'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { RangeApi } from '@udecode/plate';
import {
  type CursorData,
  type CursorOverlayState,
  useCursorOverlay,
} from '@udecode/plate-selection/react';

// WIP

export function Cursor({
  id,
  caretPosition,
  data,
  selection,
  selectionRects,
}: CursorOverlayState<CursorData>) {
  const { style, selectionStyle = style } = data ?? ({} as CursorData);
  const isCursor = RangeApi.isCollapsed(selection);

  console.log('Cursor', id, caretPosition, selectionRects);

  return (
    <>
      {selectionRects.map((position, i) => {
        return (
          <div
            key={i}
            className={cn(
              'pointer-events-none absolute z-10',
              id === 'selection' && 'bg-red-500',
              id === 'selection' && isCursor && 'bg-red-500'
            )}
            style={{
              ...selectionStyle,
              ...position,
            }}
          />
        );
      })}
      {caretPosition && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-0.5',
            id === 'drag' && 'w-px bg-red-500'
          )}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export function CursorOverlay() {
  const { cursors } = useCursorOverlay();
  return (
    <>
      {cursors.map((cursor) => (
        <Cursor key={cursor.id} {...cursor} />
      ))}
    </>
  );
}
