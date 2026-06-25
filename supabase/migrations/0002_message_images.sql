-- =====================================================================
-- FindIT — поддержка изображений в сообщениях чата
-- ---------------------------------------------------------------------
-- Добавляет тип сообщения и image_url. body остаётся NOT NULL (пустая
-- строка для сообщений только с картинкой).
--
-- Storage bucket `chat-images` создайте в Supabase Dashboard:
--   Storage → New bucket → chat-images (private)
--   Политики — см. комментарии в lib/chat/chatService.ts (uploadChatImage).
-- =====================================================================

do $$ begin
  create type message_type as enum ('text', 'image');
exception when duplicate_object then null; end $$;

alter table messages
  add column if not exists message_type message_type not null default 'text',
  add column if not exists image_url text;

alter table messages drop constraint if exists messages_content_check;

alter table messages add constraint messages_content_check check (
  (message_type = 'text' and char_length(trim(body)) > 0)
  or (message_type = 'image' and image_url is not null)
);

create index if not exists idx_messages_type
  on messages(conversation_id, message_type, created_at desc);
