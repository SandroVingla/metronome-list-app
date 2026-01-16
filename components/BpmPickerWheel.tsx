import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface BpmPickerWheelProps {
  visible: boolean;
  currentBpm: number;
  onSelect: (bpm: number) => void;
  onClose: () => void;
}

export const BpmPickerWheel: React.FC<BpmPickerWheelProps> = ({
  visible,
  currentBpm,
  onSelect,
  onClose,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedBpm, setSelectedBpm] = useState(currentBpm);
  
  // BPM de 40 a 300
  const bpmValues = Array.from({ length: 261 }, (_, i) => i + 40);
  
  const ITEM_HEIGHT = 60;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const bpm = bpmValues[index];
    if (bpm) {
      setSelectedBpm(bpm);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedBpm);
    onClose();
  };

  // Scroll para o BPM atual quando abrir
  const handleLayout = () => {
    const index = bpmValues.indexOf(currentBpm);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: false,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.title}>Selecione o BPM</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Picker Wheel */}
          <View style={styles.pickerContainer}>
            {/* Linha de seleção superior */}
            <View style={styles.selectionLineTop} />
            
            {/* ScrollView com valores */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onLayout={handleLayout}
            >
              {/* Padding superior */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
              
              {/* Items */}
              {bpmValues.map((bpm, index) => {
                const isSelected = bpm === selectedBpm;
                const distance = Math.abs(bpm - selectedBpm);
                const opacity = Math.max(0.2, 1 - distance * 0.03);
                const scale = isSelected ? 1 : Math.max(0.6, 1 - distance * 0.02);

                return (
                  <View
                    key={bpm}
                    style={[
                      styles.item,
                      { height: ITEM_HEIGHT },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        isSelected && styles.itemTextSelected,
                        {
                          opacity,
                          transform: [{ scale }],
                        },
                      ]}
                    >
                      {bpm}
                    </Text>
                  </View>
                );
              })}
              
              {/* Padding inferior */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>

            {/* Linha de seleção inferior */}
            <View style={styles.selectionLineBottom} />

            {/* Label BPM */}
            <View style={styles.bpmLabel}>
              <Text style={styles.bpmLabelText}>BPM</Text>
            </View>
          </View>

          {/* Botão Confirmar */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  pickerContainer: {
    height: 300,
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#64748b',
  },
  itemTextSelected: {
    color: '#ffffff',
    fontSize: 56,
  },
  selectionLineTop: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f97316',
    zIndex: 10,
    marginTop: -30,
  },
  selectionLineBottom: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f97316',
    zIndex: 10,
    marginTop: 30,
  },
  bpmLabel: {
    position: 'absolute',
    right: 40,
    top: '50%',
    marginTop: -10,
    zIndex: 11,
  },
  bpmLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    margin: 20,
    backgroundColor: '#149605',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});