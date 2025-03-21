// In listModal.tsx
import * as React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import { fetchTraktLists, addToTraktList } from '@/services/traktapi';

export interface MyListsProps {
  visible: boolean;
  onClose: () => void;
  itemId?: number;
  type?: 'movie' | 'show';
}

const MyLists: React.FC<MyListsProps> = ({ visible, onClose, itemId, type = 'movie' }) => {
  const [lists, setLists] = React.useState<any[]>([]);
  const [selectedList, setSelectedList] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLists = async () => {
      setLoading(true);
      try {
        const traktLists = await fetchTraktLists();
        setLists(traktLists);
        setError(null);
      } catch (err: any) {
        setError('Failed to load lists');
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      loadLists();
    }
  }, [visible]);

  const handleConfirm = async () => {    
    if (selectedList && itemId) {
      try {
        await addToTraktList(selectedList, itemId, type);
      } catch (err: any) {
        console.error(err)
        setError('Failed to add movie to list');
        return;
      }
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add to Trakt List</Text>

          {loading && <Text style={styles.text}>Loading...</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {!loading && !error && lists.length === 0 && (
            <Text style={styles.text}>No lists found</Text>
          )}
          {!loading && !error && lists.length > 0 && (
            <ScrollView style={styles.listContainer}>
              {lists.map((list) => (
                <Pressable
                  key={list.ids.trakt}
                  style={styles.radioItem}
                  onPress={() => setSelectedList(list.ids.trakt.toString())}
                >
                  <View style={styles.radio}>
                    {selectedList === list.ids.trakt.toString() && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{list.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]} 
              onPress={onClose}
            >
              <Text style={styles.buttonOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonFilled]} 
              onPress={handleConfirm}
            >
              <Text style={styles.buttonFilledText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: 'white',
  },
  text: {
    color: 'white',
  },
  listContainer: { 
    maxHeight: 300,
  },
  radioItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  radioLabel: { 
    fontSize: 16, 
    marginLeft: 8,
    color: 'white',
  },
  error: { 
    color: 'red', 
    marginBottom: 10 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  button: { 
    flex: 1, 
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonFilled: {
    backgroundColor: 'white',
  },
  buttonOutlineText: {
    color: 'white',
  },
  buttonFilledText: {
    color: 'black',
  },
});

export default MyLists;