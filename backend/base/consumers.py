import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Myuser, Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            self.group_name = f'user_{self.user.username}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            # Send existing unread notifications on connect
            await self.send_existing_notifications()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Optional: Handle client messages if needed

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'data': event.get('data', {}),
            'id': event.get('id')
        }))

    @database_sync_to_async
    def get_unread_notifications(self):
        return list(Notification.objects.filter(user=self.user, read=False).values('id', 'message', 'data', 'created_at'))

    async def send_existing_notifications(self):
        notifications = await self.get_unread_notifications()
        for notif in notifications:
            await self.send(text_data=json.dumps({
                'type': 'send_notification',
                'message': notif['message'],
                'data': notif['data'],
                'id': notif['id']
            }))