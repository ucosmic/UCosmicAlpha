//namespace UCosmic.Cqrs
//{
//    public class HybridMemoryAzureViewManager : IManageViews
//    {
//        private readonly MemoryViewManager _memory;
//        private readonly AzureCacheViewManager _azure;

//        public HybridMemoryAzureViewManager(MemoryViewManager memory, AzureCacheViewManager azure)
//        {
//            _memory = memory;
//            _azure = azure;
//        }

//        public TView Get<TView>()
//        {
//            // first try to get the view from memory
//            var view = _memory.Get<TView>();

//            // if memory was missed, try to get view from azure
//            if (Equals(view, default(TView)) && _azure != null)
//            {
//                view = _azure.Get<TView>();
//                if (!Equals(view, default(TView)))
//                    _memory.Set<TView>(view);
//            }

//            return view;
//        }

//        public void Set<TView>(object value)
//        {
//            // set both
//            _memory.Set<TView>(value);
//            _azure.Set<TView>(value);
//        }
//    }
//}