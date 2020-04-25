
export function canUseWebP() {
    var elem = document.createElement('canvas');

    if (elem.getContext && elem.getContext('2d')) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // very old browser like IE 8, canvas not supported
    return false;
}

/**
 * Get the thumbnail dimensions to use for a given player size.
 *
 * @param {Object} options
 * @param {number} options.width The width of the player
 * @param {number} options.height The height of the player
 * @return {Object} The width and height
 */
export function getThumbnailDimensions({ width, height }) {
    let roundedWidth = width;
    let roundedHeight = height;

    // If the original width is a multiple of 320 then we should
    // not round up. This is to keep the native image dimensions
    // so that they match up with the actual frames from the video.
    //
    // For example 640x360, 960x540, 1280x720, 1920x1080
    //
    // Round up to nearest 100 px to improve cacheability at the
    // CDN. For example, any width between 601 pixels and 699
    // pixels will render the thumbnail at 700 pixels width.
    if (roundedWidth % 320 !== 0) {
        roundedWidth = Math.ceil(width / 100) * 100;
        roundedHeight = Math.round((roundedWidth / width) * height);
    }

    return {
        width: roundedWidth,
        height: roundedHeight
    };
}

export function getVimeoThumbnailUrl(uri, width, height, crop = false) {
  ({ width, height } = getThumbnailDimensions({ width, height }));
  const devicePixelRatio = window.devicePixelRatio || 1;
  width *= devicePixelRatio;
  height *= devicePixelRatio;

  const imageId = uri.split('/').pop();
  let thumbnailUrl = `https://i.vimeocdn.com/video/${imageId}`;
  thumbnailUrl += `.${canUseWebP() ? 'webp' : 'jpg'}`;
  thumbnailUrl += `?${crop ? 'm' : ''}w=${width}&${crop ? 'm' : ''}h=${height}`;
  thumbnailUrl += `&q=${devicePixelRatio > 1 ? 70 : 85}`;
  return thumbnailUrl;
}
