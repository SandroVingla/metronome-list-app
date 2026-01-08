import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AudioChannels, SoundType } from '../types';

interface ControlPanelProps {
  channels: AudioChannels;
  soundType: SoundType;
  onChannelToggle: (channel: keyof AudioChannels) => void;
  onSoundTypeChange: (soundType: SoundType) => void;
  onTapTempo: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  channels,
  soundType,
  onChannelToggle,
  onSoundTypeChange,
  onTapTempo,
}) => {
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  const soundTypes: { value: SoundType; label: string }[] = [
    { value: 'original', label: 'Click Original' },
    { value: 'soft', label: 'Soft Click' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'wood', label: 'Wood' },
    { value: 'digital', label: 'Digital' },
  ];

  const getSoundTypeLabel = () => {
    return soundTypes.find((s) => s.value === soundType)?.label || 'Click Original';
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Channel Buttons L/R/C */}
        <View style={styles.channelGroup}>
          {(['L', 'R', 'C'] as const).map((channel) => (
            <TouchableOpacity
              key={channel}
              style={[
                styles.channelButton,
                channels[channel] && styles.channelButtonActive,
              ]}
              onPress={() => onChannelToggle(channel)}
            >
              <Text
                style={[
                  styles.channelText,
                  channels[channel] && styles.channelTextActive,
                ]}
              >
                {channel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sound Type Selector */}
        <Pressable
          style={styles.soundSelector}
          onPress={() => setShowSoundPicker(!showSoundPicker)}
        >
          <Text style={styles.soundSelectorText} numberOfLines={1}>
            {getSoundTypeLabel()}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#ffffff" />
        </Pressable>

        {/* Tap Tempo Button */}
        <TouchableOpacity style={styles.tapButton} onPress={onTapTempo}>
          <Text style={styles.tapButtonText}>Tap</Text>
        </TouchableOpacity>
      </View>

      {/* Sound Type Picker */}
      {showSoundPicker && (
        <View style={styles.pickerContainer}>
          {soundTypes.map((sound) => (
            <TouchableOpacity
              key={sound.value}
              style={[
                styles.pickerItem,
                soundType === sound.value && styles.pickerItemActive,
              ]}
              onPress={() => {
                onSoundTypeChange(sound.value);
                setShowSoundPicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  soundType === sound.value && styles.pickerItemTextActive,
                ]}
              >
                {sound.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 8,
  },
  channelGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  channelButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelButtonActive: {
    backgroundColor: '#475569',
  },
  channelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  channelTextActive: {
    color: '#ffffff',
  },
  soundSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  soundSelectorText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  tapButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  tapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  pickerItemActive: {
    backgroundColor: '#16a34a',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  pickerItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});