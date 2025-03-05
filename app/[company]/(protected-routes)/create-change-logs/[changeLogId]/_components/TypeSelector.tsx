import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React from 'react'



const TypeSelector = () => {
  return (
    <div className="space-y-3">
    <Label className="text-sm font-medium">Type</Label>
    <RadioGroup defaultValue="NewFeature" className='flex gap-3'>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="NewFeature" id="NewFeature" />
        <Label htmlFor="NewFeature">New feature</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="BugFix" id="NewFeature" />
        <Label htmlFor="NewFeature">Bug fix</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Upgrade" id="Upgrade" />
        <Label htmlFor="Upgrade">Upgrade</Label>
      </div>
    </RadioGroup>
  </div>
  )
}

export default TypeSelector