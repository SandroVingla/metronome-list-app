import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

interface BpmPickerWheelProps {
  visible: boolean;
  currentBpm: number;
  onSelect: (bpm: number) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 60;

export const BpmPickerWheel: React.FC<BpmPickerWheelProps> = ({
  visible,
  currentBpm,
  onSelect,
  onClose,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [selectedBpm, setSelectedBpm] = useState(currentBpm);
  
  // BPM de 40 a 300
  const bpmValues = Array.from({ length: 261 }, (_, i) => i + 40);

  // Scroll para o BPM atual quando abrir
  useEffect(() => {
    if (visible && flatListRef.current) {
      setTimeout(() => {
        const index = bpmValues.indexOf(currentBpm);
        if (index !== -1) {
          // Scroll para a posição exata (offset = index * height)
          flatListRef.current?.scrollToOffset({
            offset: index * ITEM_HEIGHT,
            animated: false,
          });
          setSelectedBpm(currentBpm);
        }
      }, 300);
    }
  }, [visible]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Não faz nada - vamos usar onMomentumScrollEnd
  }).current;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const bpm = bpmValues[index];
    
    if (bpm && bpm >= 40 && bpm <= 300) {
      setSelectedBpm(bpm);
    }
  };

  const handleScrollEndDrag = (event: any) => {
    // Não fazer snap aqui - deixar o momentum scroll acontecer
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const bpm = bpmValues[index];
    
    if (bpm) {
      setSelectedBpm(bpm);
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Fazer snap APENAS quando o scroll terminar completamente
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const targetOffset = index * ITEM_HEIGHT;
    
    // Snap suave para o item mais próximo
    flatListRef.current?.scrollToOffset({
      offset: targetOffset,
      animated: true,
    });
    
    const bpm = bpmValues[index];
    if (bpm) {
      setSelectedBpm(bpm);
    }
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleConfirm = () => {
    onSelect(selectedBpm);
    onClose();
  };

  const scrollToBpm = (bpm: number) => {
    const index = bpmValues.indexOf(bpm);
    if (index !== -1 && flatListRef.current) {
      // Scroll para posição exata
      flatListRef.current.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });
      setSelectedBpm(bpm);
    }
  };

  const renderItem = ({ item: bpm }: { item: number }) => {
    const isSelected = bpm === selectedBpm;
    const distance = Math.abs(bpm - selectedBpm);
    const opacity = Math.max(0.3, 1 - distance * 0.1);
    const scale = isSelected ? 1.1 : Math.max(0.7, 1 - distance * 0.05);

    return (
      <TouchableOpacity
        style={[styles.item, { height: ITEM_HEIGHT }]}
        activeOpacity={0.7}
        onPress={() => scrollToBpm(bpm)}
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
      </TouchableOpacity>
    );
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

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
            {/* Área de seleção com fundo */}
            <View style={styles.selectionArea} />
            
            {/* Linha superior */}
            <View style={styles.selectionLineTop} />
            
            {/* FlatList */}
            <FlatList
              ref={flatListRef}
              data={bpmValues}
              renderItem={renderItem}
              keyExtractor={(item) => item.toString()}
              getItemLayout={getItemLayout}
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onScrollEndDrag={handleScrollEndDrag}
              contentContainerStyle={styles.listContent}
              onScrollToIndexFailed={() => {}}
              removeClippedSubviews={false}
            />

            {/* Linha inferior */}
            <View style={styles.selectionLineBottom} />

            {/* Label BPM */}
            <View style={styles.bpmLabel}>
              <Text style={styles.bpmLabelText}>BPM</Text>
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>
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
    height: ITEM_HEIGHT * 5, // 5 itens visíveis (300px)
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  listContent: {
    paddingTop: ITEM_HEIGHT * 2, // Padding para que o primeiro item fique centralizado
    paddingBottom: ITEM_HEIGHT * 2, // Padding para que o último item fique centralizado
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 2, // Ajuste para centralizar entre as linhas
  },
  itemText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#64748b',
  },
  itemTextSelected: {
    color: '#ffffff',
    fontSize: 48,
  },
  selectionArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    zIndex: 5,
  },
  selectionLineTop: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: ITEM_HEIGHT * 2,
    height: 2,
    backgroundColor: '#16a34a',
    zIndex: 10,
  },
  selectionLineBottom: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: ITEM_HEIGHT * 3,
    height: 2,
    backgroundColor: '#16a34a',
    zIndex: 10,
  },
  bpmLabel: {
    position: 'absolute',
    right: 30,
    top: ITEM_HEIGHT * 2.5 - 10,
    zIndex: 11,
  },
  bpmLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});