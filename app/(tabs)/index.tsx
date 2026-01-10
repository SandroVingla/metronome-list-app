import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ControlPanel } from '../../components/ControlPanel';
import { MetronomeItem } from '../../components/MetronomeItem';
import { useMetronome } from '../../hooks/useMetronome';

export default function HomeScreen() {
  // Manter tela ligada enquanto usa o app
  useKeepAwake();

  const {
    metronomes,
    channels,
    soundType,
    calculatedBpm,
    tapCount,
    toggleMetronome,
    updateBpm,
    updateName,
    updateTimeSignature,
    addMetronome,
    deleteMetronome,
    toggleChannel,
    changeSoundType,
    tapTempo,
  } = useMetronome();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="musical-notes" size={24} color="#ffffff" />
          <Text style={styles.title}>Metronome List</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Control Panel */}
      <ControlPanel
        channels={channels}
        soundType={soundType}
        calculatedBpm={calculatedBpm}
        tapCount={tapCount}
        onChannelToggle={toggleChannel}
        onSoundTypeChange={changeSoundType}
        onTapTempo={tapTempo}
      />

      {/* Metronome List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {metronomes.map((metro) => (
          <MetronomeItem
            key={metro.id}
            metronome={metro}
            onTogglePlay={toggleMetronome}
            onUpdateBpm={updateBpm}
            onUpdateName={updateName}
            onUpdateTimeSignature={updateTimeSignature}
            onDelete={deleteMetronome}
          />
        ))}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addMetronome}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Adicionar Metrônomo</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helpButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 20,
  },
});