import { Button } from "@/components/ui/button";

type Props = {
	secondsLeft: number;
	onRefresh: () => void;
	onLogout: () => void;
};

export function SessionWarning({ secondsLeft, onRefresh, onLogout }: Props) {
	const mins = Math.floor(secondsLeft / 60);
	const secs = Math.max(0, Math.floor(secondsLeft % 60));

	return (
		<div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
			<div
				style={{
					background: "white",
					border: "1px solid #e5e7eb",
					padding: 12,
					borderRadius: 8,
					boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
				}}
			>
				<div style={{ marginBottom: 8, fontWeight: 600 }}>
					Session expiring soon
				</div>
				<div style={{ marginBottom: 12 }}>
					Your session will expire in {mins}m {secs}s. Would you like to refresh
					your session?
				</div>
				<div style={{ display: "flex", gap: 8 }}>
					<Button onClick={onRefresh}>Refresh session</Button>
					<Button onClick={onLogout} variant="ghost">
						Log out
					</Button>
				</div>
			</div>
		</div>
	);
}

export default SessionWarning;
