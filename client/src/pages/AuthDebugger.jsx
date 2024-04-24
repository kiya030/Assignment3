import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";
import '../style/AuthDebugger.css';

export default function AuthDebugger() {
  const { user } = useAuth0();
  const { accessToken } = useAuthToken();

  return (
    <div className="authDebugger">
      <div className="section"> 
        <p className="title">Access Token:</p> 
        <div className="content"> 
          <pre>{JSON.stringify(accessToken, null, 2)}</pre>
        </div>
      </div>
      <div className="section"> 
        <p className="title">User Info</p>
        <div className="content">
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}