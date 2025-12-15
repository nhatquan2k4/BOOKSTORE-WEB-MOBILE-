using System.Threading.Channels;
using BookStore.Application.Events;

namespace BookStore.Application.Services.System
{
    public interface IEventBus
    {
        Task PublishAsync<T>(T eventMessage) where T : IEventMessage;
        ChannelReader<IEventMessage> Reader { get; }
    }

    public class InMemoryEventBus : IEventBus
    {
        private readonly Channel<IEventMessage> _channel;

        public InMemoryEventBus()
        {
            var options = new BoundedChannelOptions(1000)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _channel = Channel.CreateBounded<IEventMessage>(options);
        }

        public async Task PublishAsync<T>(T eventMessage) where T : IEventMessage
        {
            await _channel.Writer.WriteAsync(eventMessage);
        }

        public ChannelReader<IEventMessage> Reader => _channel.Reader;
    }
}
