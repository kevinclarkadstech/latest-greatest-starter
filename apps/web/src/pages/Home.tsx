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
import { logger } from "../dependencies/logger";

const Home: React.FC = () => {
  // const greeting = trpc.greeting.useQuery();
  const greetingQuery = useQuery(trpc.greeting.queryOptions({ name: "World" }));
  logger.info("Home component rendered with greeting data", {
    ssn: "123-45-6789", // This will be masked by Axe before being logged
    greeting: greetingQuery.data,
    isLoading: greetingQuery.isLoading,
  });
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
