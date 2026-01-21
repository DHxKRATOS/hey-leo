import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  Download, 
  Heart,
  Briefcase,
  Palette,
  Code,
  Users,
  Megaphone,
  Building,
  Stethoscope,
  Camera,
  Wrench,
  Plus,
  Crown,
  Lock
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

interface User {
  id: string
  email: string
  name: string
}

interface UserProfile {
  id: string
  email: string
  name: string
  plan: string
  cards_count: number
  contacts_count: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPro: boolean
  isNew: boolean
  isFavorite: boolean
  downloads: number
  rating: number
  tags: string[]
  preview?: string
}

interface TemplatesPageProps {
  user: User
  userProfile: UserProfile | null
  onCreateFromTemplate: (templateId: string) => void
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Executive',
    description: 'Clean, professional design perfect for C-level executives and senior managers',
    category: 'Business',
    thumbnail: '/templates/modern-executive.jpg',
    isPro: false,
    isNew: true,
    isFavorite: false,
    downloads: 1250,
    rating: 4.8,
    tags: ['executive', 'corporate', 'professional']
  },
  {
    id: '2',
    name: 'Creative Portfolio',
    description: 'Vibrant design showcasing your creative work with image galleries and portfolios',
    category: 'Creative',
    thumbnail: '/templates/creative-portfolio.jpg',
    isPro: true,
    isNew: false,
    isFavorite: true,
    downloads: 890,
    rating: 4.9,
    tags: ['creative', 'portfolio', 'colorful']
  },
  {
    id: '3',
    name: 'Tech Minimalist',
    description: 'Sleek, minimalist design for developers, engineers, and tech professionals',
    category: 'Technology',
    thumbnail: '/templates/tech-minimal.jpg',
    isPro: false,
    isNew: false,
    isFavorite: false,
    downloads: 2100,
    rating: 4.7,
    tags: ['tech', 'minimal', 'developer']
  },
  {
    id: '4',
    name: 'Healthcare Professional',
    description: 'Trust-building design for doctors, nurses, and healthcare workers',
    category: 'Healthcare',
    thumbnail: '/templates/healthcare.jpg',
    isPro: true,
    isNew: false,
    isFavorite: false,
    downloads: 645,
    rating: 4.6,
    tags: ['medical', 'healthcare', 'trust']
  },
  {
    id: '5',
    name: 'Real Estate Agent',
    description: 'Professional design with property showcase and contact optimization',
    category: 'Real Estate',
    thumbnail: '/templates/realestate.jpg',
    isPro: false,
    isNew: false,
    isFavorite: true,
    downloads: 1680,
    rating: 4.8,
    tags: ['realestate', 'property', 'sales']
  },
  {
    id: '6',
    name: 'Consultant Pro',
    description: 'Authority-building design for consultants and professional services',
    category: 'Consulting',
    thumbnail: '/templates/consultant.jpg',
    isPro: true,
    isNew: true,
    isFavorite: false,
    downloads: 420,
    rating: 4.9,
    tags: ['consulting', 'authority', 'professional']
  }
]

const categories = [
  { id: 'all', name: 'All Templates', icon: Grid, count: mockTemplates.length },
  { id: 'business', name: 'Business', icon: Briefcase, count: 12 },
  { id: 'creative', name: 'Creative', icon: Palette, count: 8 },
  { id: 'technology', name: 'Technology', icon: Code, count: 15 },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope, count: 6 },
  { id: 'realestate', name: 'Real Estate', icon: Building, count: 9 },
  { id: 'consulting', name: 'Consulting', icon: Users, count: 7 }
]

export function TemplatesPage({ user, userProfile, onCreateFromTemplate }: TemplatesPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [showOnlyFree, setShowOnlyFree] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(['2', '5'])

  const filteredTemplates = mockTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory
      const matchesFilter = !showOnlyFree || !template.isPro
      
      return matchesSearch && matchesCategory && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const handleUseTemplate = (template: Template) => {
    if (template.isPro && userProfile?.plan === 'free') {
      // Show upgrade modal
      alert('This is a Pro template. Please upgrade your plan to use it.')
      return
    }
    onCreateFromTemplate(template.id)
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">Choose from professionally designed card templates</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Submit Template
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-light text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </div>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyFree}
                    onChange={(e) => setShowOnlyFree(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm">Free templates only</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredTemplates.length} templates
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Template Preview */}
                  <div className="relative bg-gray-100 h-48 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-6xl text-primary/30 font-bold">
                        {template.name.charAt(0)}
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      {template.isNew && <Badge className="bg-primary text-white">NEW</Badge>}
                      {template.isPro && (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-600 bg-yellow-50">
                          <Crown className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      )}
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary-hover"
                        onClick={() => handleUseTemplate(template)}
                        disabled={template.isPro && userProfile?.plan === 'free'}
                      >
                        {template.isPro && userProfile?.plan === 'free' ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Upgrade
                          </>
                        ) : (
                          'Use Template'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            favorites.includes(template.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">{template.rating}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Download className="w-4 h-4 mr-1" />
                          <span className="text-sm">{template.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-2xl text-primary/60 font-bold">
                        {template.name.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.isNew && <Badge className="bg-primary text-white text-xs">NEW</Badge>}
                        {template.isPro && (
                          <Badge variant="outline" className="border-yellow-400 text-yellow-600 bg-yellow-50 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span>{template.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          <span>{template.downloads.toLocaleString()}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => toggleFavorite(template.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            favorites.includes(template.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary-hover"
                        onClick={() => handleUseTemplate(template)}
                        disabled={template.isPro && userProfile?.plan === 'free'}
                      >
                        {template.isPro && userProfile?.plan === 'free' ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Upgrade
                          </>
                        ) : (
                          'Use Template'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}