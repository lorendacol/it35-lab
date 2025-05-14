import { useState, useEffect } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonRow,
  IonCol,
  IonAvatar,
  IonText,
  IonPopover,
  IonIcon,
  IonGrid
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';
import { pencil, trash } from 'ionicons/icons';

interface Post {
  post_id: string;
  user_id: number;
  username: string;
  avatar_url: string;
  post_content: string;
  post_created_at: string;
}

const SearchContainer = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [popoverState, setPopoverState] = useState<{ open: boolean; event: Event | null; postId: string | null }>({
    open: false,
    event: null,
    postId: null
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*').order('post_created_at', { ascending: false });
      if (!error) setPosts(data as Post[]);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.post_content.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }, [searchTerm, posts]);

  const deletePost = async (post_id: string) => {
    await supabase.from('posts').delete().match({ post_id });
    setPosts(posts.filter(post => post.post_id !== post_id));
  };

  const startEditingPost = (post: Post) => {
    // Logic to edit the post (similar to FeedContainer)
  };

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Search Posts</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard style={{ padding: '1rem', marginBottom: '20px', background: '#f4f4f4', borderRadius: '8px' }}>
            <IonCardHeader style={{ paddingBottom: '0' }}>
              <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Search Posts</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ padding: '0' }}>
              <IonInput
                value={searchTerm}
                onIonChange={(e) => setSearchTerm(e.detail.value!)}
                placeholder="Search for posts..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '15px',
                  border: '1px solid #ccc',
                  fontSize: '1.1rem',
                  background: '#fff',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px',
                }}
              />
            </IonCardContent>
          </IonCard>

          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <IonCard key={post.post_id} style={{ marginTop: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <IonCardHeader style={{ paddingBottom: '0', paddingTop: '10px' }}>
                  <IonRow>
                    <IonCol size="1.85">
                      <IonAvatar>
                        <img alt={post.username} src={post.avatar_url} />
                      </IonAvatar>
                    </IonCol>
                    <IonCol>
                      <IonCardTitle style={{ marginTop: '10px', fontWeight: 'bold' }}>{post.username}</IonCardTitle>
                      <IonCardSubtitle style={{ color: '#777', fontSize: '0.85rem' }}>
                        {new Date(post.post_created_at).toLocaleString()}
                      </IonCardSubtitle>
                    </IonCol>
                    <IonCol size="auto">
                      <IonButton
                        fill="clear"
                        onClick={(e) => setPopoverState({ open: true, event: e.nativeEvent, postId: post.post_id })}
                      >
                        <IonIcon color="secondary" icon={pencil} />
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonCardHeader>

                <IonCardContent style={{ padding: '15px' }}>
                  <IonText style={{ color: 'black', fontSize: '1rem' }}>
                    <p>{post.post_content}</p>
                  </IonText>
                </IonCardContent>

                <IonPopover
                  isOpen={popoverState.open && popoverState.postId === post.post_id}
                  event={popoverState.event}
                  onDidDismiss={() => setPopoverState({ open: false, event: null, postId: null })}
                >
                  <IonButton
                    fill="clear"
                    onClick={() => { startEditingPost(post); setPopoverState({ open: false, event: null, postId: null }); }}
                  >
                    Edit
                  </IonButton>
                  <IonButton
                    fill="clear"
                    color="danger"
                    onClick={() => { deletePost(post.post_id); setPopoverState({ open: false, event: null, postId: null }); }}
                  >
                    Delete
                  </IonButton>
                </IonPopover>
              </IonCard>
            ))
          ) : (
            <IonLabel>No results found for "{searchTerm}"</IonLabel>
          )}
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default SearchContainer;
