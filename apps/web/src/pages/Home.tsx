import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
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
import { useEffect, useRef, useState } from "react";
import { testCache } from "../main";
import { authClient } from "../dependencies/auth";

const Home: React.FC = () => {
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

  const modal = useRef<HTMLIonModalElement>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to send verification code.");
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      logger.error("Failed to send OTP", { err });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await authClient.signIn.emailOtp({ email, otp });
      if (result.error) {
        setError(result.error.message ?? "Invalid verification code.");
      } else {
        logger.info("Signed in successfully via OTP", { email });
        modal.current?.dismiss();
        setEmail("");
        setOtp("");
        setOtpSent(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      logger.error("Failed to verify OTP", { err });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalDismiss = () => {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setError(null);
  };

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

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <IonButton id="open-otp-modal">Sign In with Email</IonButton>
        </div>

        <IonModal
          ref={modal}
          trigger="open-otp-modal"
          onDidDismiss={handleModalDismiss}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Sign In</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => modal.current?.dismiss()}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Email"
              labelPlacement="floating"
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value ?? "")}
              placeholder="Enter your email"
              disabled={otpSent}
            />

            {!otpSent && (
              <IonButton
                expand="block"
                style={{ marginTop: "16px" }}
                onClick={handleSendOtp}
                disabled={!email || isLoading}
              >
                {isLoading ? "Sending..." : "Get Verification Code"}
              </IonButton>
            )}

            {otpSent && (
              <>
                <IonInput
                  label="Verification Code"
                  labelPlacement="floating"
                  type="text"
                  value={otp}
                  onIonInput={(e) => setOtp(e.detail.value ?? "")}
                  placeholder="Enter the code from your email"
                  style={{ marginTop: "16px" }}
                />
                <IonButton
                  expand="block"
                  style={{ marginTop: "16px" }}
                  onClick={handleVerifyOtp}
                  disabled={!otp || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </IonButton>
              </>
            )}

            {error && (
              <p style={{ color: "var(--ion-color-danger)", marginTop: "8px" }}>
                {error}
              </p>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
