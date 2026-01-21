import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card } from './ui/card'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (cardData: { name: string; description: string; type: string }) => void
}

export function NewCardModal({ isOpen, onClose, onCreate }: NewCardModalProps) {
  const [cardName, setCardName] = useState('')
  const [cardDescription, setCardDescription] = useState('')
  const [cardType, setCardType] = useState('business')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cardName.trim()) {
      return
    }

    setIsCreating(true)
    
    try {
      await onCreate({
        name: cardName.trim(),
        description: cardDescription.trim() || 'A new digital business card',
        type: cardType
      })
      
      // Reset form
      setCardName('')
      setCardDescription('')
      setCardType('business')
      onClose()
    } catch (error) {
      console.error('Error creating card:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setCardName('')
      setCardDescription('')
      setCardType('business')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface shadow-2xl border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-surface border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Create New Card</h2>
            <p className="text-sm text-text-secondary mt-1">
              Give your card a name and tell us what it's for
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
            className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-sm font-medium text-text-primary">
              Card Name *
            </Label>
            <Input
              id="cardName"
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g., Professional Card, Networking Card"
              className="input-refined focus:border-primary focus:ring-primary/20"
              maxLength={50}
              disabled={isCreating}
              required
            />
            <div className="text-xs text-text-tertiary text-right">
              {cardName.length}/50
            </div>
          </div>

          {/* Card Description */}
          <div className="space-y-2">
            <Label htmlFor="cardDescription" className="text-sm font-medium text-text-primary">
              Description
            </Label>
            <Textarea
              id="cardDescription"
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              placeholder="Brief description of how you'll use this card (optional)"
              className="input-refined focus:border-primary focus:ring-primary/20 resize-none"
              rows={3}
              maxLength={150}
              disabled={isCreating}
            />
            <div className="text-xs text-text-tertiary text-right">
              {cardDescription.length}/150
            </div>
          </div>

          {/* Card Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-primary">
              Card Type
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCardType('business')}
                disabled={isCreating}
                className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                  cardType === 'business'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-border text-text-secondary hover:bg-muted hover:border-border-hover'
                }`}
              >
                <div className="text-lg mb-1">💼</div>
                <div className="text-xs font-medium">Business</div>
              </button>
              
              <button
                type="button"
                onClick={() => setCardType('personal')}
                disabled={isCreating}
                className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                  cardType === 'personal'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-border text-text-secondary hover:bg-muted hover:border-border-hover'
                }`}
              >
                <div className="text-lg mb-1">⭐</div>
                <div className="text-xs font-medium">Personal</div>
              </button>
              
              <button
                type="button"
                onClick={() => setCardType('networking')}
                disabled={isCreating}
                className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                  cardType === 'networking'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-border text-text-secondary hover:bg-muted hover:border-border-hover'
                }`}
              >
                <div className="text-lg mb-1">🤝</div>
                <div className="text-xs font-medium">Networking</div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-lg"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={!cardName.trim() || isCreating}
              className="flex-1 btn-primary rounded-lg"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Card'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}