package bean;

public class WebRtcSignalBean {
	String type;
	String from;
	String sendto;
	String sdp;
	Ice ice;
	String sdpMid;	
	
    public static class Ice {
    	private String candidate;
        private String sdpMid;
        private String sdpMLineIndex;
        private String usernameFragment;
        
        public String getCandidate() {
			return candidate;
		}
		public void setCandidate(String candidate) {
			this.candidate = candidate;
		}
		public String getSdpMid() {
			return sdpMid;
		}
		public void setSdpMid(String sdpMid) {
			this.sdpMid = sdpMid;
		}
		public String getSdpMLineIndex() {
			return sdpMLineIndex;
		}
		public void setSdpMLineIndex(String sdpMLineIndex) {
			this.sdpMLineIndex = sdpMLineIndex;
		}
		public String getUsernameFragment() {
			return usernameFragment;
		}
		public void setUsernameFragment(String usernameFragment) {
			this.usernameFragment = usernameFragment;
		}
		
    }

	public String getSendto() {
		return sendto;
	}

	public void setSendto(String sendto) {
		this.sendto = sendto;
	}

	public String getSdp() {
		return sdp;
	}

	public void setSdp(String sdp) {
		this.sdp = sdp;
	}

	public Ice getIce() {
		return ice;
	}

	public void setIce(Ice ice) {
		this.ice = ice;
	}

	public String getSdpMid() {
		return sdpMid;
	}

	public void setSdpMid(String sdpMid) {
		this.sdpMid = sdpMid;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}
	
}
