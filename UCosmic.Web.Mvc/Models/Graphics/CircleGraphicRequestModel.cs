namespace UCosmic.Web.Mvc.Models
{
    public class CircleGraphicRequestModel
    {
        public CircleGraphicRequestModel()
        {
            Opacity = 1;
            Side = 48;
        }

        public string Text { get; set; }
        public double Opacity { get; set; }
        public int Side { get; set; }
        public string Color { get; set; }   // sets all colors
        public string StrokeColor { get; set; }
        public string FillColor { get; set; }
        public string TextColor { get; set; }
    }
}