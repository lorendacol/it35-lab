import { useState, useEffect } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
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
  IonIcon
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
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Search Posts</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput
                value={searchTerm}
                onIonChange={(e) => setSearchTerm(e.detail.value!)}
                placeholder="Search for posts..."
              />
            </IonCardContent>
          </IonCard>

          {filteredPosts.map(post => (
            <IonCard key={post.post_id} style={{ marginTop: '2rem' }}>
              <IonCardHeader>
                <IonRow>
                  <IonCol size="1.85">
                    <IonAvatar>
                      <img alt={post.username} src={post.avatar_url} />
                    </IonAvatar>
                  </IonCol>
                  <IonCol>
                    <IonCardTitle>{post.username}</IonCardTitle>
                    <IonCardSubtitle>{new Date(post.post_created_at).toLocaleString()}</IonCardSubtitle>
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

              <IonCardContent>
                <IonText style={{ color: 'black' }}>
                  <h1>{post.post_content}</h1>
                </IonText>
              </IonCardContent>

              <IonPopover
                isOpen={popoverState.open && popoverState.postId === post.post_id}
                event={popoverState.event}
                onDidDismiss={() => setPopoverState({ open: false, event: null, postId: null })}
              >
                <IonButton fill="clear" onClick={() => { startEditingPost(post); setPopoverState({ open: false, event: null, postId: null }); }}>
                  Edit
                </IonButton>
                <IonButton fill="clear" color="danger" onClick={() => { deletePost(post.post_id); setPopoverState({ open: false, event: null, postId: null }); }}>
                  Delete
                </IonButton>
              </IonPopover>
            </IonCard>
          ))}
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default SearchContainer;
