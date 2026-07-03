import { useState } from 'react';
import AvatarPicker from './AvatarPicker';
import { getSavedName, getSavedAvatar, saveIdentity } from '../identity';
import { AVATARS } from '../avatarList';

interface Props {
  onJoin: (name: string, avatar: string) => void;
}

export default function JoinModal({ onJoin }: Props) {
  const [name, setName] = useState(getSavedName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || AVATARS[0].key);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    saveIdentity(name.trim(), avatar);
    onJoin(name.trim(), avatar);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-800 text-center">Join the room 🃏</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alice"
              maxLength={30}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pick your avatar</label>
            <AvatarPicker selected={avatar} onChange={setAvatar} />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5
                       font-semibold transition disabled:opacity-40"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
