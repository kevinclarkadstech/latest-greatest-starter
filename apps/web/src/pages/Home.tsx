import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
// import { trpc } from '../trpc';
import "./Home.css";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../dependencies/trpc";

const Home: React.FC = () => {
  // const greeting = trpc.greeting.useQuery();
  const greetingQuery = useQuery(trpc.greeting.queryOptions({ name: "World" }));
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
        {greetingQuery.isLoading && (
          <p style={{ textAlign: "center" }}>Loading...</p>
        )}
        {greetingQuery.data && (
          <p style={{ textAlign: "center" }}>{greetingQuery.data}</p>
        )}
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
