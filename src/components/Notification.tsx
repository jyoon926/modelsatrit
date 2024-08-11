import { ToastContainer, ToastPosition, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notification = () => {
  return (
    <>
      <ToastContainer className="toast" />
    </>
  );
};

export const useNotification = () => {
  const notify = (type: string, message: string) => {
    toast.dismiss();
    switch (type) {
      case 'loading':
        toast.info(message || 'Loading...');
        break;
      case 'success':
        toast.success(message || 'Success!');
        break;
      case 'error':
        toast.error(message || 'Error occurred!');
        break;
      default:
        toast(message || 'Notification');
    }
  };

  const toastPromise = (promise: Promise<any>, messages: { pending: string; success: string; error: string }) => {
    const { pending, success, error } = messages;

    toast.promise(
      promise,
      {
        pending: pending || 'Processing...',
        success: success || 'Process completed successfully!',
        error: error || 'Something went wrong!',
      },
      {
        position: 'bottom-right' as ToastPosition,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'toast',
      }
    );
  };

  return { notify, toastPromise };
};

export default Notification;
