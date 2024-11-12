import React from 'react';
import './ShootingStarsBackground.css';

const ShootingStarsBackground = () => {
    return (
        <div className="night absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="shooting_star" />
            ))}
        </div>
    );
};

export default ShootingStarsBackground; 