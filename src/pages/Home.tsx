import { 
  IonButtons,
   IonButton,
    IonContent, 
    IonHeader, 
    IonMenuButton, 
    IonPage, 
    IonTitle, 
    IonToolbar 
} from '@ionic/react';
const Home: React.FC = () => {
 
  return (
    <IonPage>
        <IonHeader>
        <IonToolbar>
        <IonButtons slot='start'>
              <IonMenuButton ></IonMenuButton>
            </IonButtons>
            <IonTitle>Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton routerLink="/it35-lab/app/home/details" expand="full">
        Details
          </IonButton>
      </IonPage>
    );
  };
  
  export default Home;