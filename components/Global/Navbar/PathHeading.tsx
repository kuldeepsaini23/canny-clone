"use client";
import { usePathname } from 'next/navigation';
import React from 'react'



const PathHeading = () => {
  const pathname = usePathname();

  const formattedPath = pathname.includes("/feedback") ?  "All Posts" :
  pathname.includes("/post") ? "Post" :
  pathname.split('/').at(-1);
  return (
    <h1 className="text-lg font-semibold text-secondary-foreground text-white capitalize">{formattedPath}</h1>
  )
}

export default PathHeading