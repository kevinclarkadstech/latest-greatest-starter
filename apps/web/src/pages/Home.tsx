import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { trpc } from '../trpc';
import './Home.css';

const Home: React.FC = () => {
  const greeting = trpc.greeting.useQuery();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        {greeting.data && <p style={{ textAlign: 'center' }}>{greeting.data}</p>}
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
