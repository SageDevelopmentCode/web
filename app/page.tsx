import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <section
      className="overflow-hidden"
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: "url(/assets/ZoneOneBattle.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)",
          zIndex: 1,
        }}
      ></div>

      <div style={{ zIndex: 2, position: "relative" }}>
        <Navigation />
      </div>

      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ zIndex: 2, position: "relative" }}
      >
        <h1 className="text-6xl font-black text-white">Sage</h1>
      </div>

      {/* Characters - Right Side */}
      <div
        className="absolute bottom-0 -right-20 flex items-end gap-2 pr-8 pb-4"
        style={{ zIndex: 2 }}
      >
        <img
          src="/assets/Noah.png"
          alt="Noah"
          className="h-72 object-contain scale-x-[-1]"
        />
        <img
          src="/assets/Gabriel.png"
          alt="Gabriel"
          className="h-70 object-contain mb-30"
        />
        <img
          src="/assets/David.png"
          alt="David"
          className="h-72 object-contain -mb-5"
        />
      </div>

      {/* Characters - Left Side */}
      <div
        className="absolute bottom-0 -left-20 flex items-end gap-0 pl-0 pb-4"
        style={{ zIndex: 2 }}
      >
        <img
          src="/assets/Samson.png"
          alt="Samson"
          className="h-72 object-contain"
        />
        <img
          src="/assets/Ruth.png"
          alt="Ruth"
          className="h-70 object-contain mb-20"
        />
        <img
          src="/assets/Deborah.png"
          alt="Deborah"
          className="h-70 object-contain -mb-4"
        />
        <img
          src="/assets/Elijah.png"
          alt="Elijah"
          className="h-70 object-contain mb-10"
        />
      </div>
    </section>
  );
}
