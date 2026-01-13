import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Metronome, TimeSignature } from '../types';

interface MetronomeItemProps {
  metronome: Metronome;
  onTogglePlay: (id: string) => void;
  onUpdateBpm: (id: string, bpm: number) => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateTimeSignature: (id: string, timeSignature: TimeSignature) => void;
  onDelete: (id: string) => void;
}

export const MetronomeItem: React.FC<MetronomeItemProps> = ({
  metronome,
  onTogglePlay,
  onUpdateBpm,
  onUpdateName,
  onUpdateTimeSignature,
  onDelete,
}) => {
  const [showTimeSignaturePicker, setShowTimeSignaturePicker] = useState(false);
  const [showBpmPicker, setShowBpmPicker] = useState(false);

  const timeSignatures: TimeSignature[] = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
  
  // Gerar valores de BPM de 40 a 300
  const bpmValues = Array.from({ length: 261 }, (_, i) => i + 40); // 40 a 300

  const handleBpmSelect = (bpm: number) => {
    onUpdateBpm(metronome.id, bpm);
    setShowBpmPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Header - Nome e Delete */}
      <View style={styles.header}>
        <TextInput
          style={styles.nameInput}
          value={metronome.name}
          onChangeText={(text) => onUpdateName(metronome.id, text)}
          placeholder="Nome da música"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          onPress={() => onDelete(metronome.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#f87171" />
        </TouchableOpacity>
      </View>

      {/* Controls - Play, BPM, Time Signature */}
      <View style={styles.controls}>
        {/* Play Button */}
        <TouchableOpacity
          style={[
            styles.playButton,
            metronome.isPlaying && styles.playButtonActive,
          ]}
          onPress={() => onTogglePlay(metronome.id)}
        >
          <Ionicons
            name={metronome.isPlaying ? 'pause' : 'play'}
            size={28}
            color="#ffffff"
          />
        </TouchableOpacity>

        {/* BPM Picker Button */}
        <TouchableOpacity
          style={styles.bpmContainer}
          onPress={() => setShowBpmPicker(true)}
        >
          <Text style={styles.bpmValue}>{metronome.bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </TouchableOpacity>

        {/* Time Signature Picker */}
        <Pressable
          style={styles.timeSignatureButton}
          onPress={() => setShowTimeSignaturePicker(!showTimeSignaturePicker)}
        >
          <Text style={styles.timeSignatureText}>{metronome.timeSignature}</Text>
          <Ionicons name="chevron-down" size={16} color="#ffffff" />
        </Pressable>
      </View>

      {/* Time Signature Picker Modal */}
      {showTimeSignaturePicker && (
        <View style={styles.pickerContainer}>
          {timeSignatures.map((ts) => (
            <TouchableOpacity
              key={ts}
              style={[
                styles.pickerItem,
                ts === metronome.timeSignature && styles.pickerItemActive,
              ]}
              onPress={() => {
                onUpdateTimeSignature(metronome.id, ts);
                setShowTimeSignaturePicker(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  ts === metronome.timeSignature && styles.pickerItemTextActive,
                ]}
              >
                {ts}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* BPM Picker Modal */}
      <Modal
        visible={showBpmPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBpmPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bpmPickerModal}>
            <View style={styles.bpmPickerHeader}>
              <Text style={styles.bpmPickerTitle}>Selecione o BPM</Text>
              <TouchableOpacity onPress={() => setShowBpmPicker(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={bpmValues}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item: bpm }) => (
                <TouchableOpacity
                  style={[
                    styles.bpmPickerItem,
                    bpm === metronome.bpm && styles.bpmPickerItemActive,
                  ]}
                  onPress={() => handleBpmSelect(bpm)}
                >
                  <Text
                    style={[
                      styles.bpmPickerItemText,
                      bpm === metronome.bpm && styles.bpmPickerItemTextActive,
                    ]}
                  >
                    {bpm} BPM
                  </Text>
                </TouchableOpacity>
              )}
              initialScrollIndex={metronome.bpm - 40}
              getItemLayout={(data, index) => ({
                length: 57,
                offset: 57 * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#16a34a',
  },
  bpmContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bpmValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 50,
    textAlign: 'center',
  },
  bpmLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 4,
  },
  timeSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timeSignatureText: {
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  bpmPickerModal: {
    height: '70%',
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bpmPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bpmPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bpmPickerScroll: {
    flex: 1,
  },
  bpmPickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bpmPickerItemActive: {
    backgroundColor: '#16a34a',
  },
  bpmPickerItemText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  bpmPickerItemTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});