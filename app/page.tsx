import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <section
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: "url(/assets/ZoneOneBattle.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navigation />

      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-6xl font-black text-white">Sage</h1>
      </div>
    </section>
  );
}
