import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useSocket } from "../../../../../context/SocketContext";
import { useAppSelector } from "../../../../../hooks/reduxHooks";
import type { GetInterviewDetailsResponse } from "../../../../../types/interview/interview";
import { getInterviewDetails } from "../services/interviewServices";
import { useWebRTC } from "../../../../shared/hooks/useWebRTC";
import { useWebRTCSignaling } from "../../../../shared/hooks/useWebRTCSignaling";
import { Header } from "../../../../../app/routes/company/interviewer/InterviewerLayout";

const formatStage = (name?: string) =>
  name
    ? name
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : "—";

const initialOf = (name?: string) => (name?.trim()?.[0] ?? "?").toUpperCase();

export function InterviewerInterviewPage() {
  const { id = "" } = useParams<{ id: string }>();
  const interviewId = id;
  const navigate = useNavigate();
  const socket = useSocket();
  const myName = useAppSelector((state) => state.auth.user?.name) ?? "You"; // ⚠️ adjust if your auth slice differs

  // ---------- interview details ----------
  const [data, setData] = useState<GetInterviewDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getInterviewDetails(interviewId);
        setData(result);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load interview details.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [interviewId]);

  // ---------- webrtc ----------
  const {
    localStream,
    remoteStream,
    startLocalStream,
    createPeerConnection,
    addLocalTracks,
    setupRemoteStream,
    cleanup,
  } = useWebRTC();

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCamOn, setRemoteCamOn] = useState(true);
  const [ended, setEnded] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Start camera/mic, build the peer connection, then hand it to the signaling hook
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await startLocalStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const pc = createPeerConnection();
        addLocalTracks(stream);
        setupRemoteStream();
        setPeerConnection(pc);
      } catch {
        if (!cancelled) {
          setMediaError(
            "Couldn't access your camera or microphone. Allow access in your browser and reload.",
          );
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [
    startLocalStream,
    createPeerConnection,
    addLocalTracks,
    setupRemoteStream,
  ]);

  // Interviewer initiates the call
  useWebRTCSignaling({ socket, interviewId, peerConnection, isOffer: true });

  // Track connection state
  useEffect(() => {
    if (!peerConnection) return;
    const update = () =>
      setConnected(peerConnection.connectionState === "connected");
    peerConnection.addEventListener("connectionstatechange", update);
    return () =>
      peerConnection.removeEventListener("connectionstatechange", update);
  }, [peerConnection]);

  // Attach streams to <video> elements
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // Tell the other side about our mic/camera state (also syncs once when connected)
  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit("interview:media-state", {
      interviewId,
      audio: micOn,
      video: camOn,
    });
  }, [socket, interviewId, connected, micOn, camOn]);

  // Listen for the other side's mic/camera state and for call end
  useEffect(() => {
    if (!socket) return;

    const handleMediaState = ({
      audio,
      video,
    }: {
      audio: boolean;
      video: boolean;
    }) => {
      setRemoteMicOn(audio);
      setRemoteCamOn(video);
    };
    const handleEnd = () => {
      cleanup();
      setPeerConnection(null);
      setConnected(false);
      setEnded(true);
    };

    socket.on("interview:media-state", handleMediaState);
    socket.on("interview:end", handleEnd);
    return () => {
      socket.off("interview:media-state", handleMediaState);
      socket.off("interview:end", handleEnd);
    };
  }, [socket, cleanup]);

  const toggleMic = () => {
    const next = !micOn;
    localStream?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  };

  const toggleCam = async () => {
    if (camOn) {
      // Stop the track so the camera hardware (and its LED) really turns off
      localStream?.getVideoTracks().forEach((t) => {
        t.stop();
        localStream.removeTrack(t);
      });
      setCamOn(false);
      return;
    }

    try {
      // Reopen the camera and swap the new track into the existing call
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const track = camStream.getVideoTracks()[0];
      localStream?.addTrack(track);
      const sender = peerConnection
        ?.getSenders()
        .find((s) => s.track?.kind === "video");
      await sender?.replaceTrack(track);
      setCamOn(true);
    } catch {
      setMediaError(
        "Couldn't turn the camera back on. Check your browser's camera permission.",
      );
    }
  };

  const endCall = () => {
    socket?.emit("interview:end", { interviewId });
    cleanup();
    setPeerConnection(null);
    setConnected(false);
    setEnded(true);
  };

  // ---------- derived ----------
  const candidateName = data?.candidate.name ?? "Candidate";
  const jobTitle = data?.job.title ?? "";
  const stageName = formatStage(data?.jobStage.name);
  const scheduled = data
    ? new Date(data.interview.scheduledAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
  const showRemoteVideo = !!remoteStream && remoteCamOn;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* No sidebar on this page, so the menu handler is a no-op */}
      <Header onMenu={() => {}} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {/* ---------- basic details ---------- */}
        <section className="mb-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading interview details…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                {jobTitle}
              </h1>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Candidate</dt>
                  <dd className="font-medium text-slate-900">
                    {candidateName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Stage</dt>
                  <dd className="font-medium text-slate-900">{stageName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Scheduled</dt>
                  <dd className="font-medium text-slate-900">{scheduled}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="font-medium text-slate-900">
                    {data?.interview.duration
                      ? `${data.interview.duration} min`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </section>

        {/* ---------- video / ended ---------- */}
        {ended ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Interview ended
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The call has ended. You can safely leave this page.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-[6px] border-white bg-slate-900 shadow-xl ring-1 ring-slate-200 sm:aspect-video">
            {/* Remote video (always mounted so srcObject stays attached) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`h-full w-full object-cover ${showRemoteVideo ? "" : "invisible"}`}
            />

            {/* Remote placeholder: waiting or camera off */}
            {!showRemoteVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-4xl font-semibold text-white sm:h-32 sm:w-32 sm:text-5xl">
                  {initialOf(candidateName)}
                </div>
                {!remoteStream && (
                  <p className="text-sm text-slate-300">
                    Waiting for {candidateName} to join…
                  </p>
                )}
              </div>
            )}

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent p-3 sm:p-4">
              <div className="min-w-0 text-white">
                <p className="truncate text-sm font-semibold sm:text-base">
                  {candidateName}
                  {jobTitle && (
                    <span className="font-normal text-white/70">
                      {" "}
                      | {jobTitle}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-white/60">{stageName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
                <span
                  className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-amber-400"}`}
                />
                {connected ? "Connected" : "Connecting…"}
              </div>
            </div>

            {/* Remote mic-off badge */}
            {remoteStream && !remoteMicOn && (
              <div className="absolute bottom-24 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white sm:bottom-4">
                <MicOff size={16} />
              </div>
            )}

            {/* Self view */}
            <div className="absolute bottom-24 right-3 aspect-[4/3] w-28 overflow-hidden rounded-xl border-2 border-white bg-slate-700 shadow-lg sm:bottom-4 sm:right-4 sm:w-44">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full -scale-x-100 object-cover ${camOn ? "" : "invisible"}`}
              />
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold text-white sm:h-14 sm:w-14">
                    {initialOf(myName)}
                  </div>
                </div>
              )}
              <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white drop-shadow">
                You
              </span>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-black/60 p-2 backdrop-blur">
              <button
                onClick={toggleMic}
                aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  micOn
                    ? "bg-white/15 hover:bg-white/25"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={toggleCam}
                aria-label={camOn ? "Turn camera off" : "Turn camera on"}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  camOn
                    ? "bg-white/15 hover:bg-white/25"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {camOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button
                onClick={endCall}
                aria-label="End interview"
                className="flex h-11 w-14 items-center justify-center rounded-xl bg-red-600 text-white transition-colors hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <PhoneOff size={20} />
              </button>
            </div>

            {/* Media permission error */}
            {mediaError && (
              <div className="absolute inset-x-4 top-16 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
                {mediaError}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
