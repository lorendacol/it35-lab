import { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSearchbar,
  IonModal,
  IonButtons,
  IonText
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';

function FavoritesContainer() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }
      if (user) {
        setUserId(user.id);
        fetchFavorites(user.id);
      }
    };
    fetchUser();
  }, []);

  const fetchFavorites = async (uid: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, feedback:feedback_id(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error.message);
    } else if (data) {
      setFavorites(data);
      setFiltered(data);
    }
  };

  const toggleFavorite = async (feedbackId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, feedback_id: feedbackId });

    if (error) {
      console.error('Error unfavoriting:', error.message);
    } else {
      fetchFavorites(userId!);
    }
  };

  const handleSearch = (e: CustomEvent) => {
    const val = e.detail.value.toLowerCase();
    setSearch(val);

    const filteredList = favorites.filter(f =>
      f.feedback.title.toLowerCase().includes(val) ||
      f.feedback.content.toLowerCase().includes(val)
    );
    setFiltered(filteredList);
  };

  const openModal = (feedback: any) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Favorites</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar value={search} onIonInput={handleSearch}></IonSearchbar>
        <IonList>
          {filtered.length > 0 ? (
            filtered.map((fav) => (
              <IonItem key={fav.id}>
                <IonLabel onClick={() => openModal(fav.feedback)}>
                  <h2>{fav.feedback.title}</h2>
                  <p>{fav.feedback.content.substring(0, 50)}...</p>
                </IonLabel>
                <IonButton color="danger" onClick={() => toggleFavorite(fav.feedback.id)}>
                  Unfavorite
                </IonButton>
              </IonItem>
            ))
          ) : (
            <IonItem>
              <IonLabel>No favorites found.</IonLabel>
            </IonItem>
          )}
        </IonList>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Feedback Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedFeedback && (
              <>
                <IonText>
                  <h2>{selectedFeedback.title}</h2>
                  <p>{selectedFeedback.content}</p>
                </IonText>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}

export default FavoritesContainer;
