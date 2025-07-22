
import { useEffect, useRef } from 'react';

interface MapMarkerProps {
  mapInstance: google.maps.Map;
  coordinates: google.maps.LatLngLiteral;
}

const MapMarker = ({ mapInstance, coordinates }: MapMarkerProps) => {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    if (!mapInstance || !window.google) return;

    try {
      // If there's already a marker, remove it
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // Create custom marker
      markerRef.current = new google.maps.Marker({
        position: coordinates,
        map: mapInstance,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#9333EA" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="#9333EA" stroke-width="0.5"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 40)
        }
      });

      // Add a pulsing glow effect around the pin
      const pinGlowOverlay = new google.maps.OverlayView();
      
      pinGlowOverlay.onAdd = function() {
        try {
          const div = document.createElement('div');
          div.className = 'map-pin-glow';
          div.style.position = 'absolute';
          div.style.width = '60px';
          div.style.height = '60px';
          div.style.borderRadius = '50%';
          div.style.background = 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, rgba(147, 51, 234, 0) 70%)';
          div.style.animation = 'pulse-glow 2s infinite';
          
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            @keyframes pulse-glow {
              0% {
                transform: scale(0.8);
                opacity: 1;
              }
              70% {
                transform: scale(1.2);
                opacity: 0.7;
              }
              100% {
                transform: scale(0.8);
                opacity: 1;
              }
            }
          `;
          document.head.appendChild(styleElement);
          
          const panes = this.getPanes();
          if (panes && panes.overlayMouseTarget) {
            panes.overlayMouseTarget.appendChild(div);
            this.div_ = div;
          }
        } catch (error) {
          console.error('Error in overlay onAdd:', error);
        }
      };
      
      pinGlowOverlay.draw = function() {
        try {
          if (!this.div_) return;
          const projection = this.getProjection();
          if (!projection) return;
          
          const position = projection.fromLatLngToDivPixel(coordinates);
          if (position) {
            this.div_.style.left = (position.x - 30) + 'px';
            this.div_.style.top = (position.y - 30) + 'px';
          }
        } catch (error) {
          console.error('Error in overlay draw:', error);
        }
      };
      
      pinGlowOverlay.onRemove = function() {
        try {
          if (this.div_ && this.div_.parentNode) {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
          }
        } catch (error) {
          console.error('Error in overlay onRemove:', error);
        }
      };
      
      pinGlowOverlay.setMap(mapInstance);
      overlayRef.current = pinGlowOverlay;
      
      // Center map on the address with smooth animation
      mapInstance.panTo(coordinates);
      mapInstance.setZoom(18);

    } catch (error) {
      console.error('Error creating map marker:', error);
    }

    return () => {
      try {
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        if (overlayRef.current) {
          overlayRef.current.setMap(null);
          overlayRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up map marker:', error);
      }
    };
  }, [mapInstance, coordinates]);

  return null;
};

export default MapMarker;
