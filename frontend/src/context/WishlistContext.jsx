import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlistItems(data.wishlistItems);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    const isWished = wishlistItems.some(item => item.product._id === productId);
    
    try {
      if (isWished) {
        const item = wishlistItems.find(item => item.product._id === productId);
        await api.delete(`/wishlist/${item._id}`);
        setWishlistItems(prev => prev.filter(i => i._id !== item._id));
        toast.info('Removed from wishlist');
      } else {
        const { data } = await api.post('/wishlist', { productId });
        // The API returns the newly populated wishlist item in data.wishlistItem
        // We append it to the local state
        setWishlistItems(prev => [...prev, data.wishlistItem]);
        toast.success('Added to wishlist ❤️');
      }
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
      return { success: false };
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/${wishlistId}`);
      setWishlistItems(prev => prev.filter(i => i._id !== wishlistId));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to remove' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        fetchWishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export default WishlistContext;
