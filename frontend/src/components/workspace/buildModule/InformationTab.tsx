import React from 'react'
import { Camera, User, Briefcase, MapPin, Award, Star, Plus, X, UploadCloud } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { ProfileData } from '../../../types/buildModule'
import { INDUSTRIES, TIMEZONES } from '../../../utils/buildModuleConstants'

interface InformationTabProps {
  profile: ProfileData
  userTier: string
  onProfileUpdate: (updates: Partial<ProfileData>) => void
  onAddArrayItem: (field: keyof ProfileData, value: string) => void
  onRemoveArrayItem: (field: keyof ProfileData, index: number) => void
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function InformationTab({
  profile,
  userTier,
  onProfileUpdate,
  onAddArrayItem,
  onRemoveArrayItem,
  expandedSections,
  onExpandedSectionsChange
}: InformationTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Profile Photos */}
        <AccordionItem value="photos">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-primary" />
              <span>Profile Photos</span>
              {userTier !== 'free' && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Profile Photo */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-xs text-primary font-medium">Upload</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <UploadCloud className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <Input
                    value={profile.profile_photo_url}
                    onChange={(e) => onProfileUpdate({ profile_photo_url: e.target.value })}
                    placeholder="Or paste image URL"
                    className="text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 400x400px minimum, square aspect ratio
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Cover Image</Label>
              <div className="space-y-2">
                <div className="w-full h-24 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {profile.cover_image_url ? (
                    <img
                      src={profile.cover_image_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <span className="text-xs text-muted-foreground">Cover Image</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload Cover
                </Button>
                <Input
                  value={profile.cover_image_url}
                  onChange={(e) => onProfileUpdate({ cover_image_url: e.target.value })}
                  placeholder="Or paste cover image URL"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Company Logo */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {profile.company_logo_url ? (
                    <img
                      src={profile.company_logo_url}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <UploadCloud className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  <Input
                    value={profile.company_logo_url}
                    onChange={(e) => onProfileUpdate({ company_logo_url: e.target.value })}
                    placeholder="Company logo URL"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Basic Information */}
        <AccordionItem value="basic-info">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <span>Basic Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Full Name *
                </Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => onProfileUpdate({ full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Job Title *
                </Label>
                <Input
                  value={profile.job_title}
                  onChange={(e) => onProfileUpdate({ job_title: e.target.value })}
                  placeholder="Your job title"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Tagline
                </Label>
                <Input
                  value={profile.tagline}
                  onChange={(e) => onProfileUpdate({ tagline: e.target.value })}
                  placeholder="Brief professional tagline"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Company
                </Label>
                <Input
                  value={profile.company}
                  onChange={(e) => onProfileUpdate({ company: e.target.value })}
                  placeholder="Your company"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Industry
                </Label>
                <Select
                  value={profile.industry}
                  onValueChange={(value) => onProfileUpdate({ industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Location
                </Label>
                <Input
                  value={profile.location}
                  onChange={(e) => onProfileUpdate({ location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Experience Years
                </Label>
                <Input
                  type="number"
                  value={profile.experience_years}
                  onChange={(e) => onProfileUpdate({ experience_years: parseInt(e.target.value) || 0 })}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Availability Status
                </Label>
                <Select
                  value={profile.availability_status}
                  onValueChange={(value: 'available' | 'busy' | 'away') => 
                    onProfileUpdate({ availability_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">🟢 Available</SelectItem>
                    <SelectItem value="busy">🟡 Busy</SelectItem>
                    <SelectItem value="away">🔴 Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Bio
                </Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => onProfileUpdate({ bio: e.target.value })}
                  rows={4}
                  placeholder="Tell people about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.bio?.length || 0}/500 characters
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Contact Information */}
        <AccordionItem value="contact-info">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Contact Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Email Address
              </Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => onProfileUpdate({ email: e.target.value })}
                placeholder="your.email@company.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Phone Number
              </Label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => onProfileUpdate({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Website
              </Label>
              <Input
                type="url"
                value={profile.website}
                onChange={(e) => onProfileUpdate({ website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Timezone
              </Label>
              <Select
                value={profile.timezone}
                onValueChange={(value) => onProfileUpdate({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(timezone => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Professional Details */}
        <AccordionItem value="professional-details">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Professional Details</span>
              {userTier !== 'free' && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Skills</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const skill = prompt('Enter a skill:')
                    if (skill) onAddArrayItem('skills', skill)
                  }}
                  className="h-6 px-2"
                  disabled={userTier === 'free'}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveArrayItem('skills', index)}
                  >
                    {skill}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {profile.skills.length === 0 && userTier === 'free' && (
                  <p className="text-xs text-muted-foreground">Upgrade to Pro to add skills</p>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Achievements</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const achievement = prompt('Enter an achievement:')
                    if (achievement) onAddArrayItem('achievements', achievement)
                  }}
                  className="h-6 px-2"
                  disabled={userTier === 'free'}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm">{achievement}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveArrayItem('achievements', index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {profile.achievements.length === 0 && userTier === 'free' && (
                  <p className="text-xs text-muted-foreground">Upgrade to Pro to add achievements</p>
                )}
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Languages</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const language = prompt('Enter a language:')
                    if (language) onAddArrayItem('languages', language)
                  }}
                  className="h-6 px-2"
                  disabled={userTier === 'free'}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveArrayItem('languages', index)}
                  >
                    {language}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                {profile.languages.length === 0 && userTier === 'free' && (
                  <p className="text-xs text-muted-foreground">Upgrade to Pro to add languages</p>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Certifications</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const certification = prompt('Enter a certification:')
                    if (certification) onAddArrayItem('certifications', certification)
                  }}
                  className="h-6 px-2"
                  disabled={userTier === 'free'}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {profile.certifications.map((certification, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm">{certification}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveArrayItem('certifications', index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {profile.certifications.length === 0 && userTier === 'free' && (
                  <p className="text-xs text-muted-foreground">Upgrade to Pro to add certifications</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Education</Label>
              <Textarea
                value={profile.education}
                onChange={(e) => onProfileUpdate({ education: e.target.value })}
                placeholder="Your educational background..."
                rows={3}
                disabled={userTier === 'free'}
              />
              {userTier === 'free' && (
                <p className="text-xs text-muted-foreground mt-1">Upgrade to Pro to add education details</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}