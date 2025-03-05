
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

type Props = {
  count?: number
}

const PostLoader = ({count}: Props) => {
  return (
    <div className="space-y-4 w-full">
          {[...Array(count || 10)].map((_, index) => (
            <div key={index} className="w-full flex items-center space-x-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-10 " />
                <Skeleton className="h-4 " />
              </div>
            </div>
          ))}
        </div>
  )
}

export default PostLoader