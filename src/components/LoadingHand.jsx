import "./LoadingHand.css";

export default function LoadingHand() {
    return (
        <div className="hand-container">
            <div className="hand-wrapper">
                <div className="finger"></div>
                <div className="finger"></div>
                <div className="finger"></div>
                <div className="finger"></div>
                <div className="palm"></div>		
                <div className="thumb"></div>
            </div>
        </div>
    );
}