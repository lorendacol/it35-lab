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
  IonIcon,
  IonModal,
  IonTextarea,
  IonAlert,
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
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState<{ show: boolean; postId: string | null }>({ show: false, postId: null });

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*').order('post_created_at', { ascending: false });
      if (!error) setPosts(data as Post[]);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    setFilteredPosts(
      searchTerm === ''
        ? posts
        : posts.filter(post =>
            post.post_content.toLowerCase().includes(searchTerm.toLowerCase())
          )
    );
  }, [searchTerm, posts]);

  const deletePost = async (post_id: string) => {
    await supabase.from('posts').delete().match({ post_id });
    setPosts(posts.filter(post => post.post_id !== post_id));
  };

  const startEditingPost = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const saveEditedPost = async () => {
    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update({ post_content: editingPost.post_content })
        .eq('post_id', editingPost.post_id);
      if (!error) {
        setPosts(prev =>
          prev.map(p => (p.post_id === editingPost.post_id ? { ...p, post_content: editingPost.post_content } : p))
        );
        setIsModalOpen(false);
      }
    }
  };

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Search App Dev Posts</IonTitle>
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
                placeholder="Search app dev topics..."
              />
            </IonCardContent>
          </IonCard>

          {filteredPosts.map(post => (
            <IonCard key={post.post_id} style={{ marginTop: '2rem' }}>
              <IonCardHeader>
                <IonRow>
                  <IonCol size="2">
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
                      onClick={(e) =>
                        setPopoverState({ open: true, event: e.nativeEvent, postId: post.post_id })
                      }
                    >
                      <IonIcon icon={pencil} />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonCardHeader>

              <IonCardContent>
                <IonText color="dark">
                  <h2>{post.post_content}</h2>
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
                <IonButton fill="clear" color="danger" onClick={() => setShowAlert({ show: true, postId: post.post_id })}>
                  Delete
                </IonButton>
              </IonPopover>
            </IonCard>
          ))}

          {/* Edit Modal */}
          <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Edit Post</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>Editing as {editingPost?.username}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonTextarea
                    value={editingPost?.post_content}
                    onIonChange={(e) =>
                      setEditingPost(prev => prev ? { ...prev, post_content: e.detail.value! } : null)
                    }
                    placeholder="Update your post..."
                  ></IonTextarea>
                  <IonButton expand="block" onClick={saveEditedPost}>Save</IonButton>
                  <IonButton expand="block" color="medium" onClick={() => setIsModalOpen(false)}>Cancel</IonButton>
                </IonCardContent>
              </IonCard>
            </IonContent>
          </IonModal>

          {/* Delete Confirmation Alert */}
          <IonAlert
            isOpen={showAlert.show}
            header="Confirm Delete"
            message="Are you sure you want to delete this post?"
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => setShowAlert({ show: false, postId: null })
              },
              {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                  if (showAlert.postId) deletePost(showAlert.postId);
                  setShowAlert({ show: false, postId: null });
                }
              }
            ]}
            onDidDismiss={() => setShowAlert({ show: false, postId: null })}
          />
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default SearchContainer;
