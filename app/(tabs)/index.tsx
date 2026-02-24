import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ControlPanel } from '../../components/ControlPanel';
import { MetronomeItem } from '../../components/MetronomeItem';
import {
  getLimitMessage,
  MAX_METRONOMES,
  UPGRADE_INFO
} from '../../constants/limits';
import { useMetronome } from '../../hooks/useMetronome';
export default function HomeScreen() {
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
    pauseAll,
    canAddMore,
    remainingSlots,
  } = useMetronome();

  // ✅ FUNÇÃO PARA ADICIONAR COM VALIDAÇÃO
  const handleAddMetronome = () => {
    const wasAdded = addMetronome();
    
    if (!wasAdded) {
      // Mostrar alert de limite atingido
      Alert.alert(
        '🎵 Limite Atingido',
        getLimitMessage('metronomes'),
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: '🚀 Ver Pro', 
            onPress: showUpgradeModal
          }
        ]
      );
    }
  };

  // ✅ MODAL DE UPGRADE
  const showUpgradeModal = () => {
    const features = UPGRADE_INFO.FEATURES.join('\n');
    Alert.alert(
      '🚀 Metronome List Pro',
      `${features}\n\nApenas ${UPGRADE_INFO.PRICE}`,
      [
        { text: 'Agora não', style: 'cancel' },
        { 
          text: 'Fazer Upgrade',
          onPress: () => {
            // TODO: Implementar compra in-app ou abrir Play Store
            console.log('Abrir Play Store Pro');
          }
        }
      ]
    );
  };

  // ✅ CALCULAR ESTADO
  const showWarning = remainingSlots > 0 && remainingSlots <= 3;
  const isLimitReached = !canAddMore && MAX_METRONOMES !== Infinity;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="musical-notes" size={24} color="#ffffff" />
          <Text style={styles.title}>Metronome List Lite</Text>
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
      <FlatList
        data={metronomes}
        keyExtractor={(item) => item.id}
        renderItem={({ item: metro }) => (
          <MetronomeItem
            metronome={metro}
            onTogglePlay={toggleMetronome}
            onUpdateBpm={updateBpm}
            onUpdateName={updateName}
            onUpdateTimeSignature={updateTimeSignature}
            onDelete={deleteMetronome}
            onPauseAll={pauseAll}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <>
            {/* Add Button com validação */}
            <TouchableOpacity
              style={[
                styles.addButton,
                !canAddMore && styles.addButtonDisabled
              ]}
              onPress={handleAddMetronome}
              activeOpacity={0.7}
              disabled={!canAddMore}
            >
              <Ionicons 
                name={canAddMore ? "add" : "lock-closed"} 
                size={24} 
                color={canAddMore ? "#ffffff" : "#64748b"} 
              />
              <Text style={[
                styles.addButtonText,
                !canAddMore && styles.addButtonTextDisabled
              ]}>
                {canAddMore ? 'Adicionar Metrônomo' : 'Limite Atingido'}
              </Text>
            </TouchableOpacity>

            {/* ✅ CONTADOR E AVISOS */}
            <View style={styles.counterContainer}>
              {/* Contador */}
              <Text style={styles.counterText}>
                {metronomes.length} / {MAX_METRONOMES === Infinity ? '∞' : MAX_METRONOMES} metrônomos
              </Text>
              
              {/* Aviso próximo do limite */}
              {showWarning && (
                <Text style={styles.warningText}>
                  ⚠️ {remainingSlots === 1 
                    ? 'Resta apenas 1 slot' 
                    : `Restam apenas ${remainingSlots} slots`}
                </Text>
              )}
              
              {/* Banner de upgrade quando atingir limite */}
              {isLimitReached && (
                <TouchableOpacity 
                  style={styles.upgradeHint}
                  onPress={showUpgradeModal}
                  activeOpacity={0.8}
                >
                  <Ionicons name="rocket" size={16} color="#f59e0b" />
                  <Text style={styles.upgradeText}>
                    Upgrade para Pro e tenha metrônomos ilimitados
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#f59e0b" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bottomSpacer} />
          </>
        }
      />
       {/* Banner Ad */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId="ca-app-pub-4957093969222138/6792687058" 
          size={BannerAdSize.BANNER}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  adContainer: {
  alignItems: 'center',
  paddingVertical: 8,
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
  listContent: {
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
  addButtonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  addButtonTextDisabled: {
    color: '#64748b',
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  counterText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  upgradeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#451a03',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#78350f',
  },
  upgradeText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});