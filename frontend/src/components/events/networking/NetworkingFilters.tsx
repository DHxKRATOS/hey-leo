import React from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Checkbox } from '../../ui/checkbox'
import { Label } from '../../ui/label'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog'
import { EventFilter } from '../../../types/events'

interface NetworkingFiltersProps {
  filters: EventFilter
  onApplyFilters: (filters: Partial<EventFilter>) => void
  onClose: () => void
}

const INDUSTRIES = [
  'Technology', 'SaaS', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Design', 'Engineering'
]

const INTERESTS = [
  'AI/ML', 'Product', 'Sales', 'Marketing', 'Design', 'Engineering', 'Data Science', 'Blockchain', 'Cybersecurity'
]

const LOOKING_FOR = [
  'Partnerships', 'Investors', 'Hiring', 'Collaborations', 'Mentorship', 'Customers', 'Vendors', 'Learning'
]

export function NetworkingFilters({ filters, onApplyFilters, onClose }: NetworkingFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState<EventFilter>(filters)

  const handleIndustryToggle = (industry: string) => {
    setLocalFilters(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setLocalFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleLookingForToggle = (item: string) => {
    setLocalFilters(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(item)
        ? prev.lookingFor.filter(i => i !== item)
        : [...prev.lookingFor, item]
    }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: EventFilter = {
      industries: [],
      interests: [],
      lookingFor: [],
      companyStage: 'all'
    }
    setLocalFilters(resetFilters)
  }

  const getActiveFiltersCount = () => {
    return localFilters.industries.length + 
           localFilters.interests.length + 
           localFilters.lookingFor.length + 
           (localFilters.companyStage !== 'all' ? 1 : 0)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary" />
              <span>Filter Attendees</span>
            </div>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Industries */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Industry</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <Badge
                  key={industry}
                  variant={localFilters.industries.includes(industry) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleIndustryToggle(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={localFilters.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Looking For</Label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR.map((item) => (
                <Badge
                  key={item}
                  variant={localFilters.lookingFor.includes(item) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleLookingForToggle(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Company Stage */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Company Stage</Label>
            <RadioGroup
              value={localFilters.companyStage}
              onValueChange={(value: 'all' | 'startup' | 'growth' | 'enterprise') =>
                setLocalFilters(prev => ({ ...prev, companyStage: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm">All Stages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="startup" id="startup" />
                <Label htmlFor="startup" className="text-sm">Startup</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="growth" id="growth" />
                <Label htmlFor="growth" className="text-sm">Growth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise" id="enterprise" />
                <Label htmlFor="enterprise" className="text-sm">Enterprise</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}