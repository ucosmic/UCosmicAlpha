using System;

namespace UCosmic.Web.Mvc.Models
{
    public class CountGraphicRequestModel
    {
        public CountGraphicRequestModel()
        {
            Opacity = 1;
        }

        public int? Text { get; set; }

        public double Opacity
        {
            get { return _opacity; }
            set
            {
                if (value < 0 || value > 1)
                    throw new ArgumentOutOfRangeException("value", value, "Must be between zero and one.");
                _opacity = value;
            }
        }
        private double _opacity;
    }
}