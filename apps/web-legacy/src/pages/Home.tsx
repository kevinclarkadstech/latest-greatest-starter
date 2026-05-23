import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
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
import { useEffect, useState } from "react";
import { testCache } from "../main";
import { authClient } from "../dependencies";
import { emailOTP } from "better-auth/plugins/email-otp";

const Home: React.FC = () => {
  const [loginDetails, setLoginDetails] = useState<{
    email: string;
    verificationCode: string;
  }>({ email: "", verificationCode: "" });
  const [isEnteringVerificationCode, setIsEnteringVerificationCode] =
    useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  useEffect(() => {
    testCache.set("test-key", { value: "test-value" });
    testCache.get("test-key").then((value) => {
      logger.info(
        'Cache value for "test-key":',
        value ?? { value: "no value" },
      );
      testCache.clear().then(() => {
        testCache.get("test-key").then((value) => {
          if (value) {
            logger.error("What?");
          } else {
            logger.info(
              "Cache cleared successfully, no value found for 'test-key'",
            );
          }
        });
      });
    });
  }, []);
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
        <IonButton onClick={() => setIsLoginModalOpen(true)}>
          Open Login Modal
        </IonButton>
        <IonModal
          isOpen={isLoginModalOpen}
          onDidDismiss={() => setIsLoginModalOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Modal Title</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonInput
                  label="Email"
                  type="email"
                  value={loginDetails.email}
                  readonly={isEnteringVerificationCode}
                  onIonChange={(e) =>
                    setLoginDetails({ ...loginDetails, email: e.detail.value! })
                  }
                />
              </IonItem>
              {isEnteringVerificationCode && (
                <>
                  <IonItem>
                    <IonInput
                      label="Verification Code"
                      value={loginDetails.verificationCode}
                      onIonChange={(e) =>
                        setLoginDetails({
                          ...loginDetails,
                          verificationCode: e.detail.value!,
                        })
                      }
                    />
                  </IonItem>
                </>
              )}

              {!isEnteringVerificationCode && (
                <IonButton
                  onClick={async () => {
                    setIsEnteringVerificationCode(true);
                    logger.info("Requesting verification code for email", {
                      email: loginDetails.email,
                    });
                    await authClient.emailOtp.sendVerificationOtp({
                      email: loginDetails.email,
                      type: "sign-in",
                    });
                  }}
                >
                  Get Verification Code
                </IonButton>
              )}
              {isEnteringVerificationCode && (
                <IonButton
                  onClick={async () => {
                    try {
                      // Handle verification code submission
                      logger.info("Submitting login details", { loginDetails });
                      const result = await authClient.signIn.emailOtp({
                        email: loginDetails.email,
                        otp: loginDetails.verificationCode,
                        username: "freddy",
                      });
                      if (result.error) {
                        throw new Error(result.error.message);
                      }
                      const { user } = result.data;
                      console.log("got user data", user);
                      setIsLoginModalOpen(false);
                    } catch (error) {
                      logger.error("Login failed", { error });
                    }
                  }}
                >
                  Submit Verification Code
                </IonButton>
              )}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
