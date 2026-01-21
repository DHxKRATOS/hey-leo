import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { AboutTab } from './AboutTab'
import { LinksTab } from './LinksTab'
import { ShareTab } from './ShareTab'
import { User, Link, Share, BarChart3 } from 'lucide-react'

interface BuildModuleWithFollowUpProps {
  profileData: any
  onSave: (data: any) => void
  className?: string
}

export function BuildModuleWithFollowUp({ 
  profileData, 
  onSave, 
  className = "" 
}: BuildModuleWithFollowUpProps) {
  const [activeTab, setActiveTab] = useState('about')
  const [localData, setLocalData] = useState(profileData)

  useEffect(() => {
    setLocalData(profileData)
  }, [profileData])

  const handleTabSave = (tabData: any) => {
    const updatedData = { ...localData, ...tabData }
    setLocalData(updatedData)
    onSave(updatedData)
  }

  const tabs = [
    {
      id: 'about',
      label: 'About',
      icon: User,
      component: (
        <AboutTab 
          profileData={localData} 
          onSave={handleTabSave}
        />
      )
    },
    {
      id: 'links',
      label: 'Links',
      icon: Link,
      component: (
        <LinksTab 
          profileData={localData} 
          onSave={handleTabSave}
        />
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: (
        <div className="p-6 text-center text-text-secondary">
          <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Analytics Coming Soon</h3>
          <p className="text-sm text-text-tertiary max-w-sm mx-auto">
            Track views, interactions, and engagement with your digital business card.
          </p>
        </div>
      )
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share,
      component: (
        <ShareTab 
          cardUrl={`https://leo.cards/${profileData?.id || 'preview'}`}
          userTier="starter"
          expandedSections={['url-sharing']}
          onExpandedSectionsChange={() => {}}
        />
      )
    }
  ]

  return (
    <div className={`h-full ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 mt-6 overflow-auto">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="h-full m-0 focus-visible:outline-none"
            >
              <div className="h-full overflow-auto">
                {tab.component}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}