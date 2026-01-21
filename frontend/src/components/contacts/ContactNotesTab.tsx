import React, { useState } from "react";
import { Plus, Mic, MicOff } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { startVoiceRecognition } from "../../utils/contactHelpers";

interface ContactNotesTabProps {
  contact: any;
}

export function ContactNotesTab({ contact }: ContactNotesTabProps) {
  const [newNote, setNewNote] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSaveNote = () => {
    setNewNote("");
    setEditingNotes(false);
  };

  const handleVoiceNote = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startVoiceRecognition(
      (transcript) => {
        setNewNote((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Notes</h3>
        <Button
          onClick={() => setEditingNotes(true)}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add/Edit Note */}
      {editingNotes && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add notes about this contact, meeting details, or important information..."
                rows={4}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={handleVoiceNote}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingNotes(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Save Note
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Notes */}
      <div className="space-y-3">
        {contact.notes && (
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {new Date(contact.captured_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground">{contact.notes}</p>
          </Card>
        )}

        {!contact.notes && !editingNotes && (
          <Card className="p-8 text-center">
            <h4 className="font-medium text-foreground mb-2">No Notes Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add notes to remember important details about this contact.
            </p>
            <Button
              onClick={() => setEditingNotes(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Note
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
