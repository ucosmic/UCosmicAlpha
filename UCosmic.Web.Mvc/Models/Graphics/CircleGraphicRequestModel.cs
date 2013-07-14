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
    }
}