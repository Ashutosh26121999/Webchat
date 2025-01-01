import {useEffect, useRef} from "react";
import {useChatStore} from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import {useAuthStore} from "../store/useAuthStore";
import {formatTimestamp} from "../lib/utils";

function ChatContainer() {
  const {
    selectedUser,
    messages,
    isMessageLoading,
    getMessages,
    subscribeToMessages,
    unSubscribeToMessages,
  } = useChatStore();
  const {authUser} = useAuthStore();
  const messageEndRef = useRef(null);
  useEffect(() => {
    getMessages(selectedUser?._id);
    subscribeToMessages();
    return () => unSubscribeToMessages();
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unSubscribeToMessages,
  ]);
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [messages]);
  // DONE: add message scelation
  if (isMessageLoading)
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages?.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser?._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt='profile picture'
                />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatTimestamp(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col items-start ${
                message.senderId === authUser._id
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt='Attachment'
                  className='sm:max-w-[200px] max-w-[100px] max-h-[200px] rounded-md mb-2'
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
