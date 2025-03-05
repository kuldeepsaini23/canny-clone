import { Loader2 } from 'lucide-react'
import React from 'react'



const InfiniteLoader = () => {
  return (
    <div className='w-full h-full py-6 flex justify-center items-center'>
      <Loader2 className='animate-spin'/>
    </div>
  )
}

export default InfiniteLoader